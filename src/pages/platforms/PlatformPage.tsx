
import { useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Globe2,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { PlatformFormModal } from "./PlatformFormModal";

import {
  usePlatforms,
  useUpdatePublicInfoPolicy,
} from "../../features/platform/hooks/usePlatforms";

import type {
  PlatformListItem,
  UpdatePublicInfoPolicyRequest,
} from "../../features/platform/types/platform.types";

import "./PlatformPage.css";

export function PlatformPage() {
  const [editingPlatform, setEditingPlatform] =
    useState<PlatformListItem | null | undefined>(undefined);

  const platformsQuery = usePlatforms();
  const updatePolicy = useUpdatePublicInfoPolicy();

  const handlePolicyChange = (
    platform: PlatformListItem,
    field: keyof UpdatePublicInfoPolicyRequest,
    checked: boolean
  ) => {
    const request: UpdatePublicInfoPolicyRequest = {
      showPublicPhone: platform.showPublicPhone,
      showPublicEmail: platform.showPublicEmail,
      showPublicWebsite: platform.showPublicWebsite,
      showPublicAddress: platform.showPublicAddress,
      [field]: checked,
    };

    updatePolicy.mutate({
      platformId: platform.id,
      request,
    });
  };

  if (platformsQuery.isLoading) {
    return (
      <main className="platform-page">
        <div className="platform-state" role="status">
          <LoaderCircle
            size={28}
            className="platform-loading-icon"
            aria-hidden="true"
          />
          <strong>플랫폼 정보를 불러오는 중이다.</strong>
          <p>등록된 플랫폼과 공개정보 정책을 조회하고 있다.</p>
        </div>
      </main>
    );
  }

  if (platformsQuery.isError || !platformsQuery.data) {
    return (
      <main className="platform-page">
        <div className="platform-state platform-state-error" role="alert">
          <AlertCircle size={30} aria-hidden="true" />
          <strong>플랫폼 정보를 불러오지 못했다.</strong>
          <p>잠시 후 다시 시도한다.</p>
          <button
            type="button"
            className="platform-button platform-button--outline"
            onClick={() => void platformsQuery.refetch()}
          >
            다시 조회
          </button>
        </div>
      </main>
    );
  }

  const platforms = platformsQuery.data;
  const activeCount = platforms.filter(
    (platform) => platform.active
  ).length;

  return (
    <main className="platform-page">
      <header className="platform-page-header">
        <div className="platform-page-heading">
          <span className="platform-page-eyebrow">
            KRIM QUOTE / SETTINGS
          </span>
          <h1>플랫폼 관리</h1>
          <p>
            의뢰 플랫폼을 등록하고 고객 공개 견적서에
            표시할 사업자 정보를 설정한다.
          </p>
        </div>

        <button
          type="button"
          className="platform-button platform-button--primary"
          onClick={() => setEditingPlatform(null)}
        >
          <Plus size={17} aria-hidden="true" />
          플랫폼 등록
        </button>
      </header>

      <section
        className="platform-overview"
        aria-label="플랫폼 현황"
      >
        <div className="platform-overview-item">
          <span className="platform-overview-icon">
            <Building2 size={20} aria-hidden="true" />
          </span>
          <div>
            <span>전체 플랫폼</span>
            <strong>{platforms.length}</strong>
          </div>
        </div>

        <div className="platform-overview-item">
          <span className="platform-overview-icon">
            <CheckCircle2 size={20} aria-hidden="true" />
          </span>
          <div>
            <span>사용 중</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="platform-overview-item">
          <span className="platform-overview-icon">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <span>미사용</span>
            <strong>{platforms.length - activeCount}</strong>
          </div>
        </div>
      </section>

      {updatePolicy.isError && (
        <div className="platform-error-message" role="alert">
          <AlertCircle size={17} aria-hidden="true" />
          공개정보 정책을 저장하지 못했다.
        </div>
      )}

      <section className="platform-list">
        {platforms.length === 0 ? (
          <div className="platform-empty">
            <Building2 size={32} aria-hidden="true" />
            <h2>등록된 플랫폼이 없다.</h2>
            <p>
              플랫폼을 등록하면 의뢰 경로와 공개정보
              정책을 관리할 수 있다.
            </p>
            <button
              type="button"
              className="platform-button platform-button--primary"
              onClick={() => setEditingPlatform(null)}
            >
              <Plus size={16} aria-hidden="true" />
              첫 플랫폼 등록
            </button>
          </div>
        ) : (
          platforms.map((platform) => (
            <article
              key={platform.id}
              className="platform-card"
            >
              <div className="platform-card-header">
                <div className="platform-card-identity">
                  <span className="platform-card-icon">
                    <Building2 size={21} aria-hidden="true" />
                  </span>

                  <div>
                    <h2>{platform.name}</h2>
                    <span className="platform-code">
                      {platform.code}
                    </span>
                  </div>
                </div>

                <div className="platform-card-actions">
                  <span
                    className={
                      platform.active
                        ? "platform-status platform-status-active"
                        : "platform-status"
                    }
                  >
                    {platform.active ? "사용" : "미사용"}
                  </span>

                  <button
                    type="button"
                    className="platform-button platform-button--outline platform-edit-button"
                    onClick={() => setEditingPlatform(platform)}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    수정
                  </button>
                </div>
              </div>

              <div className="platform-policy">
                <div className="platform-policy-title">
                  <div>
                    <ShieldCheck
                      size={18}
                      aria-hidden="true"
                    />
                    <h3>공개 견적 정보</h3>
                  </div>
                  <p>
                    이 플랫폼을 통해 전달되는 고객용 견적서의
                    사업자 정보 공개 여부를 설정한다.
                  </p>
                </div>

                <div className="platform-policy-grid">
                  <PolicySwitch
                    icon={<Phone size={17} aria-hidden="true" />}
                    label="전화번호 공개"
                    description="사업자 연락처 표시"
                    checked={platform.showPublicPhone}
                    disabled={updatePolicy.isPending}
                    onChange={(checked) =>
                      handlePolicyChange(
                        platform,
                        "showPublicPhone",
                        checked
                      )
                    }
                  />

                  <PolicySwitch
                    icon={<Mail size={17} aria-hidden="true" />}
                    label="이메일 공개"
                    description="사업자 이메일 표시"
                    checked={platform.showPublicEmail}
                    disabled={updatePolicy.isPending}
                    onChange={(checked) =>
                      handlePolicyChange(
                        platform,
                        "showPublicEmail",
                        checked
                      )
                    }
                  />

                  <PolicySwitch
                    icon={<Globe2 size={17} aria-hidden="true" />}
                    label="웹사이트 공개"
                    description="사업자 웹사이트 표시"
                    checked={platform.showPublicWebsite}
                    disabled={updatePolicy.isPending}
                    onChange={(checked) =>
                      handlePolicyChange(
                        platform,
                        "showPublicWebsite",
                        checked
                      )
                    }
                  />

                  <PolicySwitch
                    icon={<MapPin size={17} aria-hidden="true" />}
                    label="주소 공개"
                    description="사업장 주소 표시"
                    checked={platform.showPublicAddress}
                    disabled={updatePolicy.isPending}
                    onChange={(checked) =>
                      handlePolicyChange(
                        platform,
                        "showPublicAddress",
                        checked
                      )
                    }
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {editingPlatform !== undefined && (
        <PlatformFormModal
          key={editingPlatform?.id ?? "new"}
          platform={editingPlatform}
          onClose={() => setEditingPlatform(undefined)}
        />
      )}
    </main>
  );
}

type PolicySwitchProps = {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

function PolicySwitch({
  icon,
  label,
  description,
  checked,
  disabled,
  onChange,
}: PolicySwitchProps) {
  return (
    <div className="platform-policy-row">
      <div className="platform-policy-info">
        <span className="platform-policy-icon">{icon}</span>
        <div>
          <span className="platform-policy-label">{label}</span>
          <small>{description}</small>
        </div>
      </div>

      <label className="platform-switch">
        <input
          type="checkbox"
          aria-label={label}
          checked={checked}
          disabled={disabled}
          onChange={(event) =>
            onChange(event.target.checked)
          }
        />
        <span className="platform-switch-slider" />
        <span className="platform-switch-text">
          {checked ? "ON" : "OFF"}
        </span>
      </label>
    </div>
  );
}
