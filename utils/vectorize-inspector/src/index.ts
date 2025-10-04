export interface Env {
	VECTORIZE_INDEX: any; // VectorizeIndex from @cloudflare/workers-types
}

interface VectorData {
	id: string;
	values?: number[];
	metadata?: Record<string, any>;
	namespace?: string;
	score?: number;
}

interface IndexInfo {
	totalVectors: number;
	vectors: VectorData[];
	pagination?: {
		hasMore: boolean;
		nextCursor?: string;
		cursorExpiration?: number;
	};
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		// CORS headers for local development
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Content-Type': 'application/json',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// Main route - show information and options
			if (path === '/' || path === '') {
				return new Response(
					JSON.stringify(
						{
							message: 'Vectorize Inspector API',
							index: 'autorag-rag-exoplanets',
							note: 'Vectorize Workers API does not support listing all vectors directly. Use /vectors/batch with known IDs or Wrangler CLI.',
							endpoints: {
								'/info': 'Get general index information',
								'/list': 'Sample vectors using semantic query (limited)',
								'/list?count=100': 'List with custom limit',
								'/export': 'Export sample vectors as JSON',
								'/vector/:id': 'Get specific vector by ID',
								'POST /vectors/batch': 'Get multiple vectors by IDs (JSON body: {ids: ["id1", "id2"]})',
								'/stats': 'Index statistics',
							},
							wranglerCLI: {
								listAll: 'wrangler vectorize list-vectors autorag-rag-exoplanets --count=1000',
								exportToFile: 'wrangler vectorize list-vectors autorag-rag-exoplanets --count=1000 > export.json',
							},
						},
						null,
						2
					),
					{ headers: corsHeaders }
				);
			}

			// Get general index information
			if (path === '/info') {
				const info = await env.VECTORIZE_INDEX.describe();
				return new Response(JSON.stringify(info, null, 2), { headers: corsHeaders });
			}

			// List vectors with pagination
			if (path === '/list') {
				const count = parseInt(url.searchParams.get('count') || '100');
				const cursor = url.searchParams.get('cursor') || undefined;

				const result = await listVectors(env.VECTORIZE_INDEX, count, cursor);

				return new Response(JSON.stringify(result, null, 2), { headers: corsHeaders });
			}

			// Export ALL vectors (may be slow for large indexes)
			if (path === '/export') {
				const allVectors = await exportAllVectors(env.VECTORIZE_INDEX);

				// Add timestamp to filename
				const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
				const filename = `vectorize-export-${timestamp}.json`;

				return new Response(JSON.stringify(allVectors, null, 2), {
					headers: {
						...corsHeaders,
						'Content-Disposition': `attachment; filename="${filename}"`,
					},
				});
			}

			// Get specific vector by ID
			if (path.startsWith('/vector/')) {
				const vectorId = path.replace('/vector/', '');
				const vectors = await env.VECTORIZE_INDEX.getByIds([vectorId]);

				if (vectors && vectors.length > 0) {
					return new Response(JSON.stringify(vectors[0], null, 2), { headers: corsHeaders });
				} else {
					return new Response(JSON.stringify({ error: 'Vector not found' }), {
						status: 404,
						headers: corsHeaders,
					});
				}
			}

			// Get multiple vectors by IDs (POST with JSON body containing array of IDs)
			if (path === '/vectors/batch' && request.method === 'POST') {
				try {
					const body = await request.json() as { ids: string[] };
					const ids = body.ids || [];
					
					if (!ids.length) {
						return new Response(JSON.stringify({ error: 'No IDs provided' }), {
							status: 400,
							headers: corsHeaders,
						});
					}

					const vectors = await env.VECTORIZE_INDEX.getByIds(ids);
					return new Response(JSON.stringify({
						count: vectors.length,
						vectors: vectors
					}, null, 2), { headers: corsHeaders });
				} catch (e: any) {
					return new Response(JSON.stringify({ error: 'Invalid request body', message: e.message }), {
						status: 400,
						headers: corsHeaders,
					});
				}
			}

			// Index statistics
			if (path === '/stats') {
				const stats = await getIndexStats(env.VECTORIZE_INDEX);
				return new Response(JSON.stringify(stats, null, 2), { headers: corsHeaders });
			}

			return new Response(JSON.stringify({ error: 'Route not found' }), {
				status: 404,
				headers: corsHeaders,
			});
		} catch (error: any) {
			return new Response(
				JSON.stringify({
					error: 'Error processing request',
					message: error.message,
					stack: error.stack,
				}),
				{ status: 500, headers: corsHeaders }
			);
		}
	},
};

// Function to list vectors with pagination
async function listVectors(index: any, count: number = 50, cursor?: string): Promise<IndexInfo> {
	try {
		const info = await index.describe();
		
		// IMPORTANT: Max topK with returnValues=true is 50
		const maxTopK = 50;
		const requestCount = Math.min(count, maxTopK);
		
		let vectors: VectorData[] = [];
		let note = '';
		
		// Try query with random vector to get sample vectors
		try {
			const dimensions = info.dimensions || 1024;
			// Create a random vector (better for finding diverse vectors)
			const randomVector = new Array(dimensions).fill(0).map(() => Math.random() * 2 - 1);
			
			const queryResult = await index.query(randomVector, {
				topK: requestCount,
				returnValues: true,
				returnMetadata: 'all',
			});
			
			if (queryResult && queryResult.matches) {
				vectors = queryResult.matches.map((match: any) => ({
					id: match.id,
					values: match.values,
					metadata: match.metadata,
					score: match.score,
				}));
				note = `Found ${vectors.length} of ${info.vectorsCount || 0} vectors. This is a sample using semantic query. For ALL vectors use /export or Wrangler CLI.`;
			}
		} catch (queryError: any) {
			note = `Error: ${queryError.message}. Use /export for progressive export or Wrangler CLI.`;
		}
		
		const totalVectors = info.vectorsCount || info.vectorCount || 0;
		
		return {
			totalVectors: totalVectors,
			vectors: vectors,
			pagination: {
				hasMore: vectors.length < totalVectors,
				nextCursor: undefined,
			},
			// @ts-ignore
			note: note,
		};
	} catch (error: any) {
		throw new Error(`Error listing vectors: ${error.message}`);
	}
}

// Function to export all vectors progressively
async function exportAllVectors(index: any): Promise<any> {
	try {
		const info = await index.describe();
		const totalVectors = info.vectorsCount || info.vectorCount || 0;
		const dimensions = info.dimensions || 1024;
		const batchSize = 50; // Max with returnValues=true
		const maxBatches = 10; // Safety limit: 10 batches = 500 vectors max
		
		const allVectors: VectorData[] = [];
		const fetchedIds = new Set<string>();
		let batchCount = 0;
		
		// Always try to fetch at least some batches even if totalVectors is unknown
		const minBatches = 3;
		
		// Fetch multiple batches with different random vectors
		while ((batchCount < minBatches || allVectors.length < totalVectors) && batchCount < maxBatches) {
			try {
				// Generate a new random vector for each batch to get diverse results
				const randomVector = new Array(dimensions).fill(0).map(() => Math.random() * 2 - 1);
				
				const queryResult = await index.query(randomVector, {
					topK: batchSize,
					returnValues: true,
					returnMetadata: 'all',
				});
				
				if (queryResult && queryResult.matches) {
					let newVectorsInBatch = 0;
					
					for (const match of queryResult.matches) {
						// Only add if we haven't seen this ID before
						if (!fetchedIds.has(match.id)) {
							fetchedIds.add(match.id);
							allVectors.push({
								id: match.id,
								values: match.values,
								metadata: match.metadata,
								score: match.score,
							});
							newVectorsInBatch++;
						}
					}
					
					// If we got very few new vectors, we're likely exhausting the space
					if (newVectorsInBatch < batchSize * 0.1) {
						break; // Stop if we're getting too many duplicates
					}
				}
				
				batchCount++;
			} catch (batchError: any) {
				// Continue with what we have
				break;
			}
		}

		const completionPercentage = totalVectors > 0 
			? Math.round(allVectors.length / totalVectors * 100)
			: null;
			
		const note = allVectors.length > 0
			? (allVectors.length < totalVectors
				? `Fetched ${allVectors.length} of ${totalVectors} vectors (${completionPercentage}%) using ${batchCount} batches. For complete export use Wrangler CLI.`
				: `Successfully fetched ${allVectors.length} vectors using ${batchCount} batches!`)
			: `No vectors found. Index may be empty or try: wrangler vectorize list-vectors autorag-rag-exoplanets --count=1000`;

		return {
			exportDate: new Date().toISOString(),
			indexName: 'autorag-rag-exoplanets',
			totalVectorsInIndex: totalVectors,
			dimensions: dimensions,
			vectorsFetched: allVectors.length,
			batchesUsed: batchCount,
			completionPercentage: completionPercentage,
			vectors: allVectors,
			note: note,
			indexInfo: info,
		};
	} catch (error: any) {
		throw new Error(`Error exporting vectors: ${error.message}`);
	}
}

// Function to get statistics
async function getIndexStats(index: any): Promise<any> {
	try {
		const info = await index.describe();

		return {
			indexName: info.name,
			dimensions: info.dimensions,
			metric: info.metric,
			vectorCount: info.vectorsCount || 0,
			description: info.description,
			timestamp: new Date().toISOString(),
		};
	} catch (error: any) {
		throw new Error(`Error getting statistics: ${error.message}`);
	}
}
