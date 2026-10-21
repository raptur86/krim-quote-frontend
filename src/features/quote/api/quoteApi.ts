
import { apiClient } from "../../../services/apiClient";

import type { ApiResponse } from "../../../types/api.types";

import type {
  QuoteUpdateRequest,
  QuoteCreateRequest,
  QuoteCreateResponse,
  QuoteListParams,
  QuotePageResponse,
  QuoteDetailResponse,
  QuoteIssueResponse,
  QuoteCopyRequest,
  QuoteCopyResponse,
  QuoteRevisionResponse,
} from "../types/quote.types";

/* =========================================================
 * Get Quotes
 * ========================================================= */

/**
 * 견적 목록 조회
 *
 * GET /api/v1/quotes
 */
export async function getQuotesApi(
  params?: QuoteListParams,
): Promise<QuotePageResponse> {
  const { data } = await apiClient.get<
    ApiResponse<QuotePageResponse>
  >("/quotes", {
    params,
  });

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적 목록을 불러오지 못했습니다.",
    );
  }

  return data.data;
}

/* =========================================================
 * Create Quote
 * ========================================================= */

/**
 * 신규 견적 생성
 *
 * POST /api/v1/quotes
 *
 * 신규 견적은 서버에서 항상 DRAFT로 생성한다.
 */
export async function createQuoteApi(
  request: QuoteCreateRequest,
): Promise<QuoteCreateResponse> {
  const { data } = await apiClient.post<
    ApiResponse<QuoteCreateResponse>
  >("/quotes", request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적 생성에 실패했습니다.",
    );
  }

  return data.data;
}

/* =========================================================
 * Get Quote Detail
 * ========================================================= */

/**
 * 견적 상세 조회
 *
 * GET /api/v1/quotes/{id}
 */
export async function getQuoteApi(
  quoteId: number,
): Promise<QuoteDetailResponse> {
  const { data } = await apiClient.get<
    ApiResponse<QuoteDetailResponse>
  >(`/quotes/${quoteId}`);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적 정보를 불러오지 못했습니다.",
    );
  }

  return data.data;
}

/* =========================================================
 * Update Quote
 * ========================================================= */

/**
 * DRAFT 견적 수정
 *
 * PUT /api/v1/quotes/{id}
 */
export async function updateQuoteApi(
  quoteId: number,
  request: QuoteUpdateRequest,
): Promise<QuoteDetailResponse> {
  const { data } = await apiClient.put<
    ApiResponse<QuoteDetailResponse>
  >(`/quotes/${quoteId}`, request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적 수정에 실패했습니다.",
    );
  }

  return data.data;
}

/* =========================================================
 * Issue Quote
 * ========================================================= */

/**
 * 견적 발행
 *
 * POST /api/v1/quotes/{id}/issue
 */
export async function issueQuoteApi(
  quoteId: number,
): Promise<QuoteIssueResponse> {
  const { data } = await apiClient.post<
    ApiResponse<QuoteIssueResponse>
  >(`/quotes/${quoteId}/issue`);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적 발행에 실패했습니다.",
    );
  }

  return data.data;
}

/* =========================================================
 * v1.2 - Copy Quote
 * ========================================================= */

/**
 * 견적 복사
 *
 * POST /api/v1/quotes/{id}/copy
 *
 * REVISION : 기존 견적의 개정본 생성
 * DUPLICATE : 독립된 새 견적으로 복제
 */
export async function copyQuoteApi(
  quoteId: number,
  request: QuoteCopyRequest,
): Promise<QuoteCopyResponse> {
  const { data } = await apiClient.post<
    ApiResponse<QuoteCopyResponse>
  >(`/quotes/${quoteId}/copy`, request);

  if (!data.success || !data.data) {
    throw new Error(
      data.message || "견적 복사에 실패했습니다.",
    );
  }

  return data.data;
}

/* =========================================================
 * v1.2 - Quote Revision History
 * ========================================================= */

/**
 * 견적 개정 이력 조회
 *
 * GET /api/v1/quotes/{id}/revisions
 *
 * 응답 data가 QuoteRevisionResponse[]인 경우
 */
export async function getQuoteRevisionsApi(
  quoteId: number,
): Promise<QuoteRevisionResponse[]> {
  const { data } = await apiClient.get<
    ApiResponse<QuoteRevisionResponse[]>
  >(`/quotes/${quoteId}/revisions`);

  if (!data.success || !Array.isArray(data.data)) {
    throw new Error(
      data.message ||
        "견적 개정 이력을 불러오지 못했습니다.",
    );
  }

  return data.data;
}
