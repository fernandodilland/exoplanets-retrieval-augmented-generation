"""
Test script to verify probability extraction from AI responses
Run this to test the regex patterns without making actual API calls
"""

import re

# Test cases with different response formats
test_responses = [
    # Test 1: With "approximately XX%"
    """Based on the provided documents, specifically the [0_Additional Resources_.pdf](#) document, we can analyze the likelihood of a celestial body being an exoplanet. 

The document mentions a **koi_score**, which is a numerical score (0–1) expressing the probability that a KOI (Kepler Object of Interest) is a true planet. A higher score indicates a higher likelihood of the celestial body being an exoplanet.

Given the information, the **koi_score** is **0.98**, which suggests a high probability of the celestial body being an exoplanet.

### Probability Percentage

Based on the **koi_score** of **0.98**, we can conclude that the probability of this celestial body being an exoplanet is approximately **98%**.""",
    
    # Test 2: With "probability of XX%"
    """Analysis shows this celestial body has characteristics consistent with an exoplanet. The probability of this being an exoplanet is 85%.""",
    
    # Test 3: With just koi_score
    """The data indicates a koi_score of 0.76 for this object, which is quite promising.""",
    
    # Test 4: With "PROBABILITY: XX%"
    """This object shows typical exoplanet characteristics.
PROBABILITY: 92%""",
    
    # Test 5: No probability information
    """There is not enough information to provide a relevant answer based on the provided documents."""
]

def extract_probability(ai_response_text):
    """Extract probability percentage from AI response"""
    probability_percentage = None
    
    try:
        # Multiple patterns to extract percentage
        
        # Try pattern 1: Explicit PROBABILITY: XX%
        probability_match = re.search(r'PROBABILITY:\s*(\d+)%', ai_response_text, re.IGNORECASE | re.MULTILINE)
        
        # Try pattern 2: "is approximately XX%"
        if not probability_match:
            probability_match = re.search(r'is\s+approximately\s+\*\*(\d+)%\*\*', ai_response_text, re.IGNORECASE)
        
        # Try pattern 3: "probability... is XX%"
        if not probability_match:
            probability_match = re.search(r'probability.*?is.*?(\d+)%', ai_response_text, re.IGNORECASE | re.DOTALL)
        
        # Try pattern 4: koi_score of 0.XX (convert to percentage)
        if not probability_match:
            koi_match = re.search(r'koi[_\s]*score.*?(?:of|is)\s+\*\*?(0\.\d+)\*\*?', ai_response_text, re.IGNORECASE | re.DOTALL)
            if koi_match:
                koi_score = float(koi_match.group(1))
                percentage_value = int(koi_score * 100)
                if 0 <= percentage_value <= 100:
                    probability_percentage = percentage_value
                    print(f"   ✓ Found koi_score: {koi_score} → {percentage_value}%")
        
        # Try pattern 5: Look for XX% near end of text
        if not probability_match and not probability_percentage:
            probability_match = re.search(r'(\d+)%\s*$', ai_response_text, re.MULTILINE)
        
        # Extract percentage from match
        if probability_match and not probability_percentage:
            percentage_str = probability_match.group(1)
            percentage_value = int(percentage_str)
            # Validate range
            if 0 <= percentage_value <= 100:
                probability_percentage = percentage_value
                print(f"   ✓ Found percentage: {percentage_value}%")
        
    except Exception as e:
        print(f"   ✗ Error extracting probability: {e}")
    
    return probability_percentage

# Run tests
print("=" * 70)
print("TESTING PROBABILITY EXTRACTION")
print("=" * 70)

for i, response in enumerate(test_responses, 1):
    print(f"\n--- Test {i} ---")
    print(f"Response preview: {response[:100]}...")
    result = extract_probability(response)
    
    if result is not None:
        print(f"   ✅ SUCCESS: Extracted {result}%")
    else:
        print(f"   ⚠️  NO PROBABILITY FOUND")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
