#!/usr/bin/env node
/**
 * Advanced Vector Exporter
 * 
 * This script progressively fetches ALL vectors from the Worker API
 * by making multiple requests until all unique vectors are collected.
 * 
 * Usage: node export-all.js [outputFile]
 * Example: node export-all.js exports/complete-export.json
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:8787';
const MAX_ITERATIONS = 100; // Safety limit
const OUTPUT_FILE = process.argv[2] || `exports/export-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.json`;

async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`  Retry ${i + 1}/${retries} after error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
}

async function getInfo() {
    console.log('📊 Getting index information...');
    const info = await fetchWithRetry(`${API_URL}/info`);
    console.log(`   Dimensions: ${info.dimensions}`);
    console.log(`   Total Vectors: ${info.vectorCount}`);
    return info;
}

async function fetchBatch(count = 50) {
    const result = await fetchWithRetry(`${API_URL}/list?count=${count}`);
    return result.vectors || [];
}

async function exportAllVectors() {
    console.log('🚀 Starting progressive vector export...\n');
    
    try {
        const info = await getInfo();
        const totalVectors = info.vectorCount;
        
        const allVectors = [];
        const fetchedIds = new Set();
        let iteration = 0;
        let consecutiveEmptyBatches = 0;
        
        console.log('\n📦 Fetching vectors in batches of 50...\n');
        
        while (fetchedIds.size < totalVectors && iteration < MAX_ITERATIONS) {
            iteration++;
            process.stdout.write(`   Batch ${iteration}: `);
            
            const batch = await fetchBatch(50);
            let newVectors = 0;
            
            for (const vector of batch) {
                if (!fetchedIds.has(vector.id)) {
                    fetchedIds.add(vector.id);
                    allVectors.push(vector);
                    newVectors++;
                }
            }
            
            console.log(`${newVectors} new vectors (Total: ${fetchedIds.size}/${totalVectors} - ${Math.round(fetchedIds.size/totalVectors*100)}%)`);
            
            // Stop if we got no new vectors for 3 consecutive batches
            if (newVectors === 0) {
                consecutiveEmptyBatches++;
                if (consecutiveEmptyBatches >= 3) {
                    console.log('   ⚠️  No new vectors in last 3 batches, stopping...');
                    break;
                }
            } else {
                consecutiveEmptyBatches = 0;
            }
            
            // Stop if we got very few new vectors
            if (newVectors < batch.length * 0.05 && iteration > 5) {
                console.log('   ⚠️  Getting too many duplicates, stopping...');
                break;
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Prepare export data
        const exportData = {
            exportDate: new Date().toISOString(),
            indexName: 'autorag-rag-exoplanets',
            totalVectorsInIndex: totalVectors,
            vectorsFetched: allVectors.length,
            completionPercentage: Math.round(allVectors.length / totalVectors * 100),
            batchesUsed: iteration,
            dimensions: info.dimensions,
            vectors: allVectors,
            note: allVectors.length < totalVectors 
                ? `Fetched ${allVectors.length} of ${totalVectors} vectors using Worker API. For complete export use: wrangler vectorize list-vectors autorag-rag-exoplanets --count=1000`
                : 'Complete export - all vectors fetched!'
        };
        
        // Save to file
        const outputPath = path.resolve(OUTPUT_FILE);
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
        
        console.log(`\n✅ Export completed!`);
        console.log(`   Vectors fetched: ${allVectors.length}/${totalVectors} (${Math.round(allVectors.length/totalVectors*100)}%)`);
        console.log(`   Batches used: ${iteration}`);
        console.log(`   Output file: ${outputPath}`);
        console.log(`   File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
        
        if (allVectors.length < totalVectors) {
            console.log(`\n⚠️  Note: Only ${Math.round(allVectors.length/totalVectors*100)}% of vectors were fetched.`);
            console.log(`   For complete export, use Wrangler CLI:`);
            console.log(`   wrangler vectorize list-vectors autorag-rag-exoplanets --count=1000 > ${OUTPUT_FILE}`);
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Make sure the Worker is running: npm run dev');
        process.exit(1);
    }
}

// Run
exportAllVectors();
