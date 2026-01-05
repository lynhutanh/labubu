import axios from "axios";
import { BadRequestException, Logger } from "@nestjs/common";
import { ICurrencyConversionResult } from "../interfaces";

const logger = new Logger("CurrencyHelper");

interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: {
    [currency: string]: number;
  };
}

const CACHE_DURATION = 3600;
let cachedRates: {
  rates: { [currency: string]: number };
  timestamp: number;
} | null = null;

// Fallback exchange rate: 1 USD = ~25,000 VND (approximate rate)
// This is used when the API is unavailable
const FALLBACK_VND_RATE = 25000;

async function getExchangeRates(): Promise<{ [currency: string]: number }> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedRates && now - cachedRates.timestamp < CACHE_DURATION) {
    logger.log(`Using cached exchange rates (VND: ${cachedRates.rates.VND})`);
    return cachedRates.rates;
  }

  try {
    logger.log("Fetching exchange rates from API...");
    const response = await axios.get<ExchangeRateResponse>(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0",
        },
      },
    );

    if (!response.data || !response.data.rates || !response.data.rates.VND) {
      logger.warn("Invalid response from exchange API, using fallback rate");
      return { VND: FALLBACK_VND_RATE };
    }

    logger.log(`Fetched exchange rate: 1 USD = ${response.data.rates.VND} VND`);

    cachedRates = {
      rates: response.data.rates,
      timestamp: now,
    };

    return response.data.rates;
  } catch (error) {
    // Use fallback rate instead of throwing error
    logger.warn(
      `Failed to fetch exchange rates: ${error instanceof Error ? error.message : "Unknown"}. Using fallback rate: 1 USD = ${FALLBACK_VND_RATE} VND`,
    );
    return { VND: FALLBACK_VND_RATE };
  }
}

export async function convertVNDToUSD(
  amountVND: number,
): Promise<ICurrencyConversionResult> {
  if (amountVND <= 0) {
    throw new BadRequestException("Amount must be greater than 0");
  }

  try {
    const rates = await getExchangeRates();
    const vndRate = rates["VND"] || FALLBACK_VND_RATE;

    if (!vndRate || vndRate <= 0) {
      logger.warn("Invalid VND rate, using fallback");
      const fallbackUsdRate = 1 / FALLBACK_VND_RATE;
      const fallbackConvertedAmount = parseFloat(
        (amountVND * fallbackUsdRate).toFixed(2),
      );
      return {
        amount: amountVND,
        from: "VND",
        to: "USD",
        rate: fallbackUsdRate,
        convertedAmount: fallbackConvertedAmount,
        timestamp: Math.floor(Date.now() / 1000),
      };
    }

    const usdRate = 1 / vndRate;
    const convertedAmount = parseFloat((amountVND * usdRate).toFixed(2));

    logger.log(
      `Converting ${amountVND} VND to USD: rate=${usdRate}, result=${convertedAmount} USD`,
    );

    return {
      amount: amountVND,
      from: "VND",
      to: "USD",
      rate: usdRate,
      convertedAmount,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (error) {
    // Use fallback instead of throwing
    logger.error(
      `Currency conversion error: ${error instanceof Error ? error.message : "Unknown"}. Using fallback rate.`,
    );
    const fallbackUsdRate = 1 / FALLBACK_VND_RATE;
    const fallbackConvertedAmount = parseFloat(
      (amountVND * fallbackUsdRate).toFixed(2),
    );
    return {
      amount: amountVND,
      from: "VND",
      to: "USD",
      rate: fallbackUsdRate,
      convertedAmount: fallbackConvertedAmount,
      timestamp: Math.floor(Date.now() / 1000),
    };
  }
}

export function clearCurrencyCache(): void {
  cachedRates = null;
}
