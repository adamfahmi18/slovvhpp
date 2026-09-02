import "server-only";

export interface AiAnalysisContext {
  companyName: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  averageMargin: number;
  topProducts: { name: string; unitsSold: number; profitPerItem: number; marginPercent: number }[];
  laggingProducts: { name: string; unitsSold: number; profitPerItem: number; marginPercent: number }[];
  costBreakdown: { label: string; percent: number }[];
}

export interface AiAnalysisResult {
  summary: string;
  costEfficiency: string[];
  profitOptimization: string[];
  productPerformance: string;
  pricingRecommendations: string[];
}

const SYSTEM_PROMPT = `Anda adalah konsultan bisnis dan akuntan biaya senior yang membantu pemilik UMKM di Indonesia membaca laporan HPP (Harga Pokok Produksi) mereka. Tulis dalam Bahasa Indonesia, singkat, konkret, dan actionable — seperti konsultan bisnis, bukan chatbot generik. Hindari basa-basi. Balas HANYA dengan JSON valid sesuai skema yang diminta, tanpa markdown fence.`;

function buildPrompt(ctx: AiAnalysisContext): string {
  return `Data bisnis "${ctx.companyName}" periode berjalan:
- Total pendapatan: ${ctx.totalRevenue}
- Total biaya: ${ctx.totalCost}
- Total profit: ${ctx.totalProfit}
- Margin rata-rata: ${ctx.averageMargin}%
- Produk terlaris: ${JSON.stringify(ctx.topProducts)}
- Produk paling lemah: ${JSON.stringify(ctx.laggingProducts)}
- Komposisi biaya: ${JSON.stringify(ctx.costBreakdown)}

Kembalikan JSON dengan struktur persis:
{
  "summary": "ringkasan performa bisnis 2-3 kalimat",
  "costEfficiency": ["saran efisiensi biaya 1", "saran 2", "saran 3"],
  "profitOptimization": ["saran optimasi profit 1", "saran 2", "saran 3"],
  "productPerformance": "ringkasan performa produk 2-3 kalimat, sebut nama produk",
  "pricingRecommendations": ["rekomendasi harga 1", "saran 2"]
}`;
}

function fallbackAnalysis(ctx: AiAnalysisContext): AiAnalysisResult {
  const marginNote =
    ctx.averageMargin < 20
      ? "Margin rata-rata masih tipis dan perlu dinaikkan agar bisnis lebih tahan terhadap kenaikan harga bahan baku."
      : "Margin rata-rata berada di level yang cukup sehat untuk pertumbuhan yang stabil.";

  const biggestCost = [...ctx.costBreakdown].sort((a, b) => b.percent - a.percent)[0];

  return {
    summary: `Pendapatan periode ini tercatat lebih tinggi dari total biaya, dengan margin rata-rata ${ctx.averageMargin.toFixed(
      1
    )}%. ${marginNote}`,
    costEfficiency: [
      biggestCost
        ? `Komponen "${biggestCost.label}" menyumbang ${biggestCost.percent.toFixed(
            1
          )}% dari total biaya — evaluasi supplier atau volume pembelian untuk komponen ini.`
        : "Tinjau kembali komponen biaya terbesar untuk mencari peluang efisiensi.",
      "Bandingkan harga bahan baku dari minimal dua pemasok setiap 3 bulan agar tidak terjebak harga lama.",
      "Pertimbangkan pembelian bahan baku dalam volume lebih besar jika arus kas memungkinkan, untuk menekan biaya per unit.",
    ],
    profitOptimization: [
      "Fokuskan promosi pada produk dengan margin tertinggi untuk mendorong bauran penjualan yang lebih menguntungkan.",
      "Evaluasi produk dengan margin di bawah rata-rata — naikkan harga bertahap atau turunkan biaya produksinya.",
      "Pantau biaya operasional bulanan agar tidak menggerus profit yang sudah didapat dari efisiensi produksi.",
    ],
    productPerformance:
      ctx.topProducts.length > 0
        ? `Produk "${ctx.topProducts[0].name}" menjadi kontributor utama dengan ${ctx.topProducts[0].unitsSold} unit terjual. ${
            ctx.laggingProducts[0]
              ? `Sementara "${ctx.laggingProducts[0].name}" tertinggal dan perlu ditinjau ulang strategi harga atau promosinya.`
              : ""
          }`
        : "Belum ada data produk yang cukup untuk dianalisis periode ini.",
    pricingRecommendations: [
      "Terapkan margin minimum yang konsisten di seluruh produk agar profitabilitas lebih terprediksi.",
      "Evaluasi harga jual setiap kali biaya bahan baku naik lebih dari 5% untuk menjaga margin.",
    ],
  };
}

async function callAnthropic(prompt: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const textBlock = data.content?.find((block: { type: string }) => block.type === "text");
  return textBlock?.text ?? null;
}

async function callOpenAi(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? null;
}

function safeParse(raw: string | null): AiAnalysisResult | null {
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.summary && parsed.costEfficiency && parsed.profitOptimization) {
      return parsed as AiAnalysisResult;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate a business-consultant-style analysis from the current business
 * numbers. Tries the configured AI provider first (ANTHROPIC_API_KEY or
 * OPENAI_API_KEY, chosen via AI_PROVIDER); falls back to a deterministic,
 * rule-based analysis when no key is configured or the call fails, so the
 * feature never breaks the page.
 */
export async function generateAiAnalysis(ctx: AiAnalysisContext): Promise<AiAnalysisResult> {
  const prompt = buildPrompt(ctx);
  const provider = process.env.AI_PROVIDER ?? "anthropic";

  try {
    const raw = provider === "openai" ? await callOpenAi(prompt) : await callAnthropic(prompt);
    const parsed = safeParse(raw);
    if (parsed) return parsed;
  } catch {
    // fall through to rule-based fallback
  }

  return fallbackAnalysis(ctx);
}
