import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface NormalizedResult {
  nsn: string;
  itemName: string;
  partNumber: string;
  cage: string;
  description: string;
  source: string;
}

// ISO Group NSN Lookup 크롤러
async function crawlIsoGroup(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.isogroup.com/nsn/${query}`;
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    const nsn = query;
    const itemName = $('h1').first().text().trim() || 'N/A';
    const partNumber = $('[data-part-number]').attr('data-part-number') || 'N/A';
    const cage = $('[data-cage]').attr('data-cage') || 'N/A';
    const description = $('[data-description]').text().trim() || 'N/A';

    if (itemName !== 'N/A') {
      return { nsn, itemName, partNumber, cage, description, source: 'ISO Group' };
    }
    return null;
  } catch (error) {
    console.error('[Crawler] ISO Group error:', error);
    return null;
  }
}

// NSN Center 크롤러
async function crawlNsnCenter(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.nsncenter.com/search?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    const nsn = query;
    const itemName = $('.item-name').first().text().trim() || 'N/A';
    const partNumber = $('.part-number').first().text().trim() || 'N/A';
    const cage = $('.cage-code').first().text().trim() || 'N/A';
    const description = $('.description').first().text().trim() || 'N/A';

    if (itemName !== 'N/A') {
      return { nsn, itemName, partNumber, cage, description, source: 'NSN Center' };
    }
    return null;
  } catch (error) {
    console.error('[Crawler] NSN Center error:', error);
    return null;
  }
}

// PartTarget 크롤러
async function crawlPartTarget(query: string): Promise<NormalizedResult | null> {
  try {
    const url = `https://www.parttarget.com/search/${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    const nsn = query;
    const itemName = $('.product-title').first().text().trim() || 'N/A';
    const partNumber = $('.product-part-number').first().text().trim() || 'N/A';
    const cage = $('.product-cage').first().text().trim() || 'N/A';
    const description = $('.product-description').first().text().trim() || 'N/A';

    if (itemName !== 'N/A') {
      return { nsn, itemName, partNumber, cage, description, source: 'PartTarget' };
    }
    return null;
  } catch (error) {
    console.error('[Crawler] PartTarget error:', error);
    return null;
  }
}

// 폴백 검색 (첫 번째 성공 결과 반환)
async function searchWithFallback(query: string): Promise<NormalizedResult | null> {
  const crawlers = [crawlIsoGroup, crawlNsnCenter, crawlPartTarget];
  
  for (const crawler of crawlers) {
    const result = await crawler(query);
    if (result) return result;
  }
  
  return null;
}

// 모든 사이트 검색
async function searchAllSources(query: string): Promise<NormalizedResult[]> {
  const results = await Promise.all([
    crawlIsoGroup(query),
    crawlNsnCenter(query),
    crawlPartTarget(query)
  ]);
  
  return results.filter((r): r is NormalizedResult => r !== null);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, searchType, searchMode } = req.body;

  if (!query) {
    return res.status(400).json({ error: '검색어를 입력하세요' });
  }

  try {
    let results;
    
    if (searchMode === 'fallback') {
      const result = await searchWithFallback(query);
      results = result ? [result] : [];
    } else {
      results = await searchAllSources(query);
    }

    return res.status(200).json({
      success: true,
      data: results,
      message: results.length > 0 
        ? `${results.length}개의 결과를 찾았습니다` 
        : '검색 결과를 찾을 수 없습니다'
    });
  } catch (error) {
    console.error('[API] Search error:', error);
    return res.status(500).json({
      success: false,
      error: '검색 중 오류가 발생했습니다'
    });
  }
}
