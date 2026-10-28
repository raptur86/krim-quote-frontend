
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertCircle,
  LoaderCircle,
  Plus,
  Power,
  PowerOff,
  Save,
} from "lucide-react";

import {
  useChangePackageFeatureActive,
  useCreatePackageFeature,
  usePackageFeatures,
  useStandardRates,
  useUpdatePackageFeature,
} from "../../features/rate/hooks/useStandardRates";

import type {
  PackageFeatureResponse,
  StandardRateListItem,
} from "../../features/rate/types/rate.types";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

type Props = {
  rateId: number;
};

type FeatureForm = {
  includedQuantity: string;
  unitName: string;
  scopeDescription: string;
  sortOrder: string;
};

const emptyForm: FeatureForm = {
  includedQuantity: "1",
  unitName: "건",
  scopeDescription: "",
  sortOrder: "0",
};

function validateForm(form: FeatureForm): string | null {
  const quantity = Number(form.includedQuantity);
  const sortOrder = Number(form.sortOrder);

  if (
    !form.includedQuantity.trim() ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return "포함 수량은 1 이상의 정수여야 한다.";
  }

  if (
    !form.sortOrder.trim() ||
    !Number.isInteger(sortOrder) ||
    sortOrder < 0
  ) {
    return "정렬순서는 0 이상의 정수여야 한다.";
  }

  return null;
}

function PackageFeatureRow({
  rateId,
  item,
}: {
  rateId: number;
  item: PackageFeatureResponse;
}) {
  const updateFeature = useUpdatePackageFeature();
  const changeActive = useChangePackageFeatureActive();

  const [form, setForm] = useState<FeatureForm>({
    includedQuantity: String(item.includedQuantity),
    unitName: item.unitName ?? "",
    scopeDescription: item.scopeDescription ?? "",
    sortOrder: String(item.sortOrder),
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      includedQuantity: String(item.includedQuantity),
      unitName: item.unitName ?? "",
      scopeDescription: item.scopeDescription ?? "",
      sortOrder: String(item.sortOrder),
    });
  }, [item]);

  const pending =
    updateFeature.isPending || changeActive.isPending;

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await updateFeature.mutateAsync({
        rateId,
        itemId: item.id,
        request: {
          includedQuantity: Number(form.includedQuantity),
          unitName: form.unitName.trim() || null,
          scopeDescription:
            form.scopeDescription.trim() || null,
          sortOrder: Number(form.sortOrder),
        },
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "포함 기능을 수정하지 못했다."
      );
    }
  }

  async function handleActiveChange() {
    const nextActive = !item.active;

    if (
      !window.confirm(
        nextActive
          ? `"${item.featureName}" 기능을 다시 사용하시겠습니까?`
          : `"${item.featureName}" 기능을 패키지에서 비활성화하시겠습니까?`
      )
    ) {
      return;
    }

    setError(null);

    try {
      await changeActive.mutateAsync({
        rateId,
        itemId: item.id,
        active: nextActive,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "포함 기능 상태를 변경하지 못했다."
      );
    }
  }

  return (
    <form
      onSubmit={handleUpdate}
      style={{
        border: "1px solid #dce5df",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        background: item.active ? "#fff" : "#f8faf9",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <strong style={{ fontSize: 13 }}>
            {item.featureName}
          </strong>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {item.categoryName} · 개별 표준단가{" "}
            {item.standardPrice.toLocaleString("ko-KR")}원
          </div>
        </div>

        <Badge variant={item.active ? "success" : "neutral"}>
          {item.active ? "사용" : "미사용"}
        </Badge>
      </div>

      <div className="rate-form-grid">
        <div className="rate-form-field">
          <label>포함 수량 *</label>
          <input
            type="number"
            min="1"
            step="1"
            value={form.includedQuantity}
            disabled={pending}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                includedQuantity: event.target.value,
              }))
            }
          />
        </div>

        <div className="rate-form-field">
          <label>단위</label>
          <input
            value={form.unitName}
            disabled={pending}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                unitName: event.target.value,
              }))
            }
          />
        </div>

        <div className="rate-form-field">
          <label>정렬순서 *</label>
          <input
            type="number"
            min="0"
            step="1"
            value={form.sortOrder}
            disabled={pending}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                sortOrder: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="rate-form-field">
        <label>포함 작업 범위</label>
        <textarea
          rows={2}
          value={form.scopeDescription}
          disabled={pending}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              scopeDescription: event.target.value,
            }))
          }
        />
      </div>

      {error && (
        <div className="rate-form-error" role="alert">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={handleActiveChange}
        >
          {item.active ? (
            <PowerOff size={15} />
          ) : (
            <Power size={15} />
          )}
          {item.active ? "비활성화" : "재활성화"}
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={pending}
        >
          {updateFeature.isPending ? (
            <LoaderCircle size={15} className="rates-spin" />
          ) : (
            <Save size={15} />
          )}
          변경 저장
        </Button>
      </div>
    </form>
  );
}

export function PackageFeaturesEditor({ rateId }: Props) {
  const packageQuery = usePackageFeatures(rateId);
  const createFeature = useCreatePackageFeature();

  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] =
    useState<number | null>(null);
  const [form, setForm] = useState<FeatureForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const featureQuery = useStandardRates({
    rateType: "FEATURE",
    active: true,
    keyword: searchKeyword || undefined,
    page: 0,
    size: 100,
    sort: "id,desc",
  });

  const items = useMemo(
    () =>
      [...(packageQuery.data ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
      ),
    [packageQuery.data]
  );

  const availableFeatures = useMemo(() => {
    const registeredIds = new Set(
      items.map((item) => item.featureRateId)
    );

    return (featureQuery.data?.content ?? []).filter(
      (feature: StandardRateListItem) =>
        !registeredIds.has(feature.id)
    );
  }, [featureQuery.data, items]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
    setSelectedFeatureId(null);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (selectedFeatureId === null) {
      setError("추가할 개별 기능을 선택해야 한다.");
      return;
    }

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await createFeature.mutateAsync({
        rateId,
        request: {
          featureRateId: selectedFeatureId,
          includedQuantity: Number(form.includedQuantity),
          unitName: form.unitName.trim() || null,
          scopeDescription:
            form.scopeDescription.trim() || null,
          sortOrder: Number(form.sortOrder),
        },
      });

      setSelectedFeatureId(null);
      setForm(emptyForm);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "패키지에 기능을 추가하지 못했다."
      );
    }
  }

  return (
    <section
      style={{
        marginTop: 24,
        paddingTop: 24,
        borderTop: "1px solid #e7ece9",
      }}
      aria-label="패키지 구성 관리"
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>
        패키지 구성 관리
      </h3>
      <p
        style={{
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.6,
          margin: "0 0 18px",
        }}
      >
        패키지에 포함할 개별 기능과 수량을 관리한다.
        포함 기능의 개별 표준단가는 패키지 금액에
        추가 합산하지 않는다.
      </p>

      {packageQuery.isLoading && (
        <p role="status">포함 기능을 불러오는 중...</p>
      )}

      {packageQuery.isError && (
        <div className="rate-form-error" role="alert">
          포함 기능을 불러오지 못했다.{" "}
          <button
            type="button"
            onClick={() => packageQuery.refetch()}
          >
            다시 조회
          </button>
        </div>
      )}

      {packageQuery.isSuccess && (
        <>
          <h4 style={{ fontSize: 13, marginBottom: 12 }}>
            등록된 기능 ({items.length}개)
          </h4>

          {items.length === 0 && (
            <p style={{ fontSize: 12, color: "#64748b" }}>
              아직 등록된 포함 기능이 없다.
            </p>
          )}

          {items.map((item) => (
            <PackageFeatureRow
              key={item.id}
              rateId={rateId}
              item={item}
            />
          ))}
        </>
      )}

      <div
        style={{
          marginTop: 20,
          padding: 16,
          border: "1px solid #d6e7db",
          borderRadius: 10,
          background: "#f5f9f6",
        }}
      >
        <h4 style={{ fontSize: 14, margin: "0 0 14px" }}>
          개별 기능 추가
        </h4>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <input
            aria-label="개별 기능 검색"
            placeholder="기능명 검색"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            style={{
              flex: 1,
              minWidth: 0,
              padding: "10px 12px",
              border: "1px solid #d0d9d3",
              borderRadius: 8,
            }}
          />
          <Button type="submit" variant="outline">
            검색
          </Button>
        </form>

        <form onSubmit={handleCreate}>
          <div className="rate-form-field">
            <label htmlFor="package-feature-select">
              추가할 기능 *
            </label>

            <select
              id="package-feature-select"
              value={selectedFeatureId ?? ""}
              disabled={
                featureQuery.isLoading ||
                createFeature.isPending
              }
              onChange={(event) => {
                const id = Number(event.target.value);
                const selected = availableFeatures.find(
                  (feature) => feature.id === id
                );

                setSelectedFeatureId(
                  event.target.value ? id : null
                );
                setForm((prev) => ({
                  ...prev,
                  unitName: selected?.defaultUnit ?? "건",
                }));
              }}
            >
              <option value="">개별 기능 선택</option>
              {availableFeatures.map((feature) => (
                <option key={feature.id} value={feature.id}>
                  {feature.categoryName} / {feature.featureName}
                  {" - "}
                  {feature.standardPrice.toLocaleString("ko-KR")}원
                </option>
              ))}
            </select>

            <small>
              최근 100개 검색 결과를 표시한다.
              목록에 없으면 기능명으로 검색한다.
            </small>
          </div>

          {featureQuery.isError && (
            <div className="rate-form-error" role="alert">
              개별 기능 목록을 불러오지 못했다.
            </div>
          )}

          <div className="rate-form-grid">
            <div className="rate-form-field">
              <label>포함 수량 *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.includedQuantity}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    includedQuantity: event.target.value,
                  }))
                }
              />
            </div>

            <div className="rate-form-field">
              <label>단위</label>
              <input
                value={form.unitName}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    unitName: event.target.value,
                  }))
                }
              />
            </div>

            <div className="rate-form-field">
              <label>정렬순서 *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="rate-form-field">
            <label>포함 작업 범위</label>
            <textarea
              rows={2}
              value={form.scopeDescription}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  scopeDescription: event.target.value,
                }))
              }
              placeholder="예 : 기본 화면 최대 5개 제공"
            />
          </div>

          {error && (
            <div className="rate-form-error" role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="primary"
              disabled={
                createFeature.isPending ||
                packageQuery.isLoading ||
                packageQuery.isError ||
                selectedFeatureId === null
              }
            >
              {createFeature.isPending ? (
                <LoaderCircle
                  size={16}
                  className="rates-spin"
                />
              ) : (
                <Plus size={16} />
              )}
              패키지에 기능 추가
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
