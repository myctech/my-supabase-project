import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * A scoring function to rank how well a product matches the user's inputs.
 * It compares the user-provided campaignBudget, campaignDuration, and intendedImpressions
 * against the product's min_campaign_budget, recommended_duration_weeks,
 * and the average of min_impressions & max_impressions.
 *
 * Adjust the weight factors below based on what matters most for your recommendations.
 */
function scoreProduct(product, { campaignBudget, campaignDuration, intendedImpressions }) {
  const budgetDiff = Math.abs(Number(campaignBudget) - product.min_campaign_budget);
  const durationDiff = Math.abs(Number(campaignDuration) - product.recommended_duration_weeks);
  const impressionsAvg = (product.min_impressions + product.max_impressions) / 2;
  const impressionsDiff = Math.abs(Number(intendedImpressions) - impressionsAvg);
  
  // Arbitrary weights: duration difference is weighted more heavily
  return budgetDiff + durationDiff * 100 + impressionsDiff / 10;
}

export async function POST(request) {
  try {
    // Parse the form data from the request
    const { campaignBudget, campaignDuration, location, sportsPreference, intendedImpressions } = await request.json();
    console.log('Received form data:', { campaignBudget, campaignDuration, location, sportsPreference, intendedImpressions });
    
    // Query the products table filtering by sports preference and location prefix.
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sport_preference', sportsPreference)
      .eq('location_prefix', location);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      // Optionally, you can relax filters or return a message if no products found.
      return NextResponse.json({ products: [] });
    }
    
    // Score each product using the provided user inputs
    const scoredProducts = data.map(product => ({
      ...product,
      score: scoreProduct(product, { campaignBudget, campaignDuration, intendedImpressions })
    }));
    
    // Sort products by score (lowest score is the best match)
    scoredProducts.sort((a, b) => a.score - b.score);
    
    // Select the top 5 products
    const recommendedProducts = scoredProducts.slice(0, 5);
    
    return NextResponse.json({ products: recommendedProducts });
  } catch (error) {
    console.error('Error in POST /api/recommendations:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
