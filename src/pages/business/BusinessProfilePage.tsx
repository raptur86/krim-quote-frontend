import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Building2, CheckCircle2, AlertCircle, ContactRound, CreditCard, FileText, ImagePlus, LoaderCircle, Save, RefreshCw, Clock3 } from "lucide-react";
import { useBusinessProfile, useUpdateBusinessProfile, useUploadBusinessLogo } from "../../features/business/hooks/useBusiness";
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
  return Object.fromEntries(Object.keys(emptyForm).map((key) => [key, profile[key as FieldName] ?? ""])) as BusinessProfileUpdateRequest;
}

function toRequest(form: BusinessProfileUpdateRequest): BusinessProfileUpdateRequest {
  return Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value?.trim() || null])) as BusinessProfileUpdateRequest;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "요청을 처리하는 중 오류가 발생했습니다.";
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <div className={`business-message business-message--${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>
      {feedback.kind === "success" ? <CheckCircle2 size={17} aria-hidden="true" /> : <AlertCircle size={17} aria-hidden="true" />}
      <span>{feedback.message}</span>
    </div>
  );
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

  if (isLoading) return (
    <main className="business-page">
      <div className="business-state" role="status"><LoaderCircle className="business-spin" size={25} aria-hidden="true" /><span>사업자 정보를 불러오는 중입니다.</span></div>
    </main>
  );

  if (isError) return (
    <main className="business-page">
      <header className="business-page__header"><div><h1>사업자 정보 관리</h1><p>견적서에 사용할 사업자 기본정보와 로고를 관리한다.</p></div></header>
      <div className="business-state business-state--error">
        <AlertCircle size={28} aria-hidden="true" />
        <strong>사업자 정보를 불러올 수 없습니다.</strong>
        <FeedbackMessage feedback={{ kind: "error", message: getErrorMessage(error) }} />
        <button type="button" className="business-button" onClick={() => void refetch()}><RefreshCw size={16} /> 다시 조회</button>
      </div>
    </main>
  );
  return (
    <main className="business-page">
      <header className="business-page__header">
        <div className="business-page__heading">
          <span className="business-page__eyebrow">BUSINESS SETTINGS</span>
          <h1>사업자 정보 관리</h1>
          <p>견적서에 사용할 사업자 기본정보와 로고를 관리한다.</p>
        </div>
        {profile?.updatedAt && <span className="business-updated"><Clock3 size={14} aria-hidden="true" /> 최근 수정 : {profile.updatedAt.replace("T", " ")}</span>}
      </header>

      <form onSubmit={(event) => void save(event)}>
        <section className="business-panel">
          <div className="business-panel__heading"><span className="business-panel__icon"><Building2 size={19} /></span><div><h2>기본정보</h2><p>사업자 등록 및 견적서에 사용하는 기본 정보</p></div></div>
          <div className="business-fields">
            <label>상호명 <em>*</em><input value={form.businessName} onChange={change("businessName")} required maxLength={150} placeholder="사업자 상호명" /></label>
            <label>브랜드명<input value={form.brandName ?? ""} onChange={change("brandName")} maxLength={150} placeholder="고객에게 표시할 브랜드명" /></label>
            <label>대표자명 <em>*</em><input value={form.representativeName} onChange={change("representativeName")} required maxLength={100} placeholder="대표자 이름" /></label>
            <label>사업자등록번호<input value={form.businessNumber ?? ""} onChange={change("businessNumber")} placeholder="000-00-00000" /></label>
          </div>
        </section>

        <section className="business-panel">
          <div className="business-panel__heading"><span className="business-panel__icon"><ContactRound size={19} /></span><div><h2>연락처 및 주소</h2><p>고객이 확인할 수 있는 사업자 연락 정보</p></div></div>
          <div className="business-fields">
            <label className="business-fields__wide">주소<input value={form.address ?? ""} onChange={change("address")} placeholder="사업장 주소" /></label>
            <label>전화번호<input value={form.phone ?? ""} onChange={change("phone")} type="tel" placeholder="연락처" /></label>
            <label>이메일<input value={form.email ?? ""} onChange={change("email")} type="email" placeholder="contact@example.com" /></label>
            <label className="business-fields__wide">웹사이트<input value={form.website ?? ""} onChange={change("website")} type="url" placeholder="https://" /></label>
          </div>
        </section>

        <section className="business-panel">
          <div className="business-panel__heading"><span className="business-panel__icon"><CreditCard size={19} /></span><div><h2>입금 계좌정보</h2><p>정산에 사용하는 사업자 계좌</p></div></div>
          <p className="business-panel__hint">계좌정보는 내부 사업자 정보로 관리하며 공개 견적에 기본 노출하지 않는다.</p>
          <div className="business-fields">
            <label>은행명<input value={form.bankName ?? ""} onChange={change("bankName")} placeholder="은행명" /></label>
            <label>예금주<input value={form.accountHolder ?? ""} onChange={change("accountHolder")} placeholder="예금주" /></label>
            <label className="business-fields__wide">계좌번호<input value={form.accountNumber ?? ""} onChange={change("accountNumber")} placeholder="계좌번호" /></label>
          </div>
        </section>

        <section className="business-panel">
          <div className="business-panel__heading"><span className="business-panel__icon"><FileText size={19} /></span><div><h2>기본 견적 안내문</h2><p>견적서에 사용할 기본 안내문</p></div></div>
          <textarea className="business-textarea" rows={5} value={form.defaultQuoteMessage ?? ""} onChange={change("defaultQuoteMessage")} placeholder="견적서에 기본으로 표시할 안내문을 입력하세요." />
        </section>

        <FeedbackMessage feedback={feedback} />
        <div className="business-actions">
          <span className="business-actions__note">필수 항목은 *로 표시한다.</span>
          <button className="business-button business-button--primary" type="submit" disabled={busy}>
            {updateMutation.isPending ? <LoaderCircle size={17} className="business-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
            {updateMutation.isPending ? "저장 중..." : "사업자 정보 저장"}
          </button>
        </div>
      </form>

      <section className="business-panel business-logo-panel">
        <div className="business-panel__heading"><span className="business-panel__icon"><ImagePlus size={19} /></span><div><h2>사업자 로고</h2><p>견적서 상단에 표시할 브랜드 이미지</p></div></div>
        <div className="business-logo-panel__body">
          <div className="business-logo-preview">
            {profile?.logoUrl ? <img src={profile.logoUrl} alt="등록된 사업자 로고" /> : <span>등록된 로고 없음</span>}
          </div>
          <div className="business-logo-controls">
            <p>PNG, JPEG, WebP 형식의 로고를 업로드할 수 있다.</p>
            <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectLogo} disabled={busy} aria-label="로고 파일 선택" />
            {selectedLogo && <span className="business-logo-filename">선택 파일 : {selectedLogo.name}</span>}
            <button type="button" className="business-button" disabled={!selectedLogo || busy} onClick={() => void uploadLogo()}>
              {logoMutation.isPending ? <LoaderCircle size={16} className="business-spin" aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
              {logoMutation.isPending ? "업로드 중..." : "로고 업로드"}
            </button>
            <FeedbackMessage feedback={logoFeedback} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default BusinessProfilePage;