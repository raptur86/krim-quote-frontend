import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  useBusinessProfile,
  useUpdateBusinessProfile,
  useUploadBusinessLogo,
} from "../../features/business/hooks/useBusiness";
import type { BusinessProfileUpdateRequest } from "../../features/business/types/business.types";
import "./BusinessProfilePage.css";

type FieldName = keyof BusinessProfileUpdateRequest;
type Feedback = { kind: "success" | "error"; message: string } | null;

const emptyForm: BusinessProfileUpdateRequest = {
  businessName: "", brandName: "", representativeName: "", businessNumber: "",
  address: "", phone: "", email: "", website: "", bankName: "",
  accountNumber: "", accountHolder: "", defaultQuoteMessage: "",
};

function fromProfile(profile: BusinessProfileUpdateRequest): BusinessProfileUpdateRequest {
  return Object.fromEntries(
    Object.keys(emptyForm).map((key) => [key, profile[key as FieldName] ?? ""]),
  ) as BusinessProfileUpdateRequest;
}

function toRequest(form: BusinessProfileUpdateRequest): BusinessProfileUpdateRequest {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, value?.trim() || null]),
  ) as BusinessProfileUpdateRequest;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "요청을 처리하는 중 오류가 발생했습니다.";
}

export function BusinessProfilePage() {
  const { data: profile, isLoading, isError, error, refetch } = useBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();
  const logoMutation = useUploadBusinessLogo();
  const [form, setForm] = useState<BusinessProfileUpdateRequest>(emptyForm);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [logoFeedback, setLogoFeedback] = useState<Feedback>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile && !isDirty) setForm(fromProfile(profile));
  }, [profile, isDirty]);

  const busy = updateMutation.isPending || logoMutation.isPending;

  const change = (field: FieldName) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setIsDirty(true);
    setFeedback(null);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!form.businessName?.trim() || !form.representativeName?.trim()) {
      setFeedback({ kind: "error", message: "상호명과 대표자명은 필수 입력 항목입니다." });
      return;
    }
    try {
      const request = toRequest(form);
      await updateMutation.mutateAsync({
        ...request,
        businessName: form.businessName.trim(),
        representativeName: form.representativeName.trim(),
      });
      setIsDirty(false);
      setFeedback({ kind: "success", message: "사업자 정보를 저장했습니다." });
    } catch (err) {
      setFeedback({ kind: "error", message: getErrorMessage(err) });
    }
  };

  const uploadLogo = async () => {
    if (!selectedLogo || busy) return;
    try {
      await logoMutation.mutateAsync(selectedLogo);
      setSelectedLogo(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
      setLogoFeedback({ kind: "success", message: "로고를 업로드했습니다." });
    } catch (err) {
      setLogoFeedback({ kind: "error", message: getErrorMessage(err) });
    }
  };

  const selectLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setLogoFeedback(null);
    if (file && !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setSelectedLogo(null);
      event.target.value = "";
      setLogoFeedback({ kind: "error", message: "PNG, JPEG, WebP 파일만 선택할 수 있습니다." });
      return;
    }
    setSelectedLogo(file);
  };

  if (isLoading) return <main className="business-page"><p role="status">사업자 정보를 불러오는 중입니다.</p></main>;
  if (isError) return (
    <main className="business-page">
      <h1>사업자 정보 관리</h1>
      <div className="business-message business-message--error" role="alert">{getErrorMessage(error)}</div>
      <button type="button" className="business-button" onClick={() => void refetch()}>다시 조회</button>
    </main>
  );

  return (
    <main className="business-page">
      <header className="business-page__header">
        <div><h1>사업자 정보 관리</h1><p>견적서에 사용할 사업자 기본정보와 로고를 관리합니다.</p></div>
        {profile?.updatedAt && <span className="business-updated">최근 수정 : {profile.updatedAt.replace("T", " ")}</span>}
      </header>

      <form onSubmit={(event) => void save(event)}>
        <section className="business-panel">
          <h2>기본정보</h2>
          <div className="business-fields">
            <label>상호명 <em>*</em><input value={form.businessName} onChange={change("businessName")} required maxLength={150} /></label>
            <label>브랜드명<input value={form.brandName ?? ""} onChange={change("brandName")} maxLength={150} /></label>
            <label>대표자명 <em>*</em><input value={form.representativeName} onChange={change("representativeName")} required maxLength={100} /></label>
            <label>사업자등록번호<input value={form.businessNumber ?? ""} onChange={change("businessNumber")} placeholder="000-00-00000" /></label>
          </div>
        </section>

        <section className="business-panel">
          <h2>연락처 및 주소</h2>
          <div className="business-fields">
            <label className="business-fields__wide">주소<input value={form.address ?? ""} onChange={change("address")} /></label>
            <label>전화번호<input value={form.phone ?? ""} onChange={change("phone")} type="tel" /></label>
            <label>이메일<input value={form.email ?? ""} onChange={change("email")} type="email" /></label>
            <label className="business-fields__wide">웹사이트<input value={form.website ?? ""} onChange={change("website")} type="url" placeholder="https://" /></label>
          </div>
        </section>

        <section className="business-panel">
          <h2>입금 계좌정보</h2>
          <p className="business-panel__hint">계좌정보는 내부 사업자 정보로 관리하며 공개 견적에 기본 노출하지 않습니다.</p>
          <div className="business-fields">
            <label>은행명<input value={form.bankName ?? ""} onChange={change("bankName")} /></label>
            <label>예금주<input value={form.accountHolder ?? ""} onChange={change("accountHolder")} /></label>
            <label className="business-fields__wide">계좌번호<input value={form.accountNumber ?? ""} onChange={change("accountNumber")} /></label>
          </div>
        </section>

        <section className="business-panel">
          <h2>기본 견적 안내문</h2>
          <textarea className="business-textarea" rows={5} value={form.defaultQuoteMessage ?? ""} onChange={change("defaultQuoteMessage")} placeholder="견적서에 기본으로 표시할 안내문을 입력하세요." />
        </section>

        {feedback && <div className={`business-message business-message--${feedback.kind}`} role="status">{feedback.message}</div>}
        <div className="business-actions">
          <button className="business-button business-button--primary" type="submit" disabled={busy}>{updateMutation.isPending ? "저장 중..." : "사업자 정보 저장"}</button>
        </div>
      </form>

      <section className="business-panel business-logo-panel">
        <h2>사업자 로고</h2>
        <div className="business-logo-panel__body">
          <div className="business-logo-preview">
            {profile?.logoUrl ? <img src={profile.logoUrl} alt="등록된 사업자 로고" /> : <span>등록된 로고 없음</span>}
          </div>
          <div className="business-logo-controls">
            <p>PNG, JPEG, WebP 형식의 로고를 업로드할 수 있습니다.</p>
            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectLogo} disabled={busy} aria-label="로고 파일 선택" />
            <button type="button" className="business-button" disabled={!selectedLogo || busy} onClick={() => void uploadLogo()}>{logoMutation.isPending ? "업로드 중..." : "로고 업로드"}</button>
            {logoFeedback && <div className={`business-message business-message--${logoFeedback.kind}`} role="status">{logoFeedback.message}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}

export default BusinessProfilePage;
