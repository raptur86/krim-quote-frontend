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
  const platformsQuery = usePlatforms();
  const updatePolicy =
    useUpdatePublicInfoPolicy();

  const handlePolicyChange = (
    platform: PlatformListItem,
    field: keyof UpdatePublicInfoPolicyRequest,
    checked: boolean,
  ) => {
    const request: UpdatePublicInfoPolicyRequest = {
      showPublicPhone:
        platform.showPublicPhone,
      showPublicEmail:
        platform.showPublicEmail,
      showPublicWebsite:
        platform.showPublicWebsite,
      showPublicAddress:
        platform.showPublicAddress,
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
        <div className="platform-state">
          플랫폼 정보를 불러오고 있습니다.
        </div>
      </main>
    );
  }

  if (
    platformsQuery.isError ||
    !platformsQuery.data
  ) {
    return (
      <main className="platform-page">
        <div className="platform-state platform-state-error">
          플랫폼 정보를 불러오지 못했습니다.
        </div>
      </main>
    );
  }

  return (
    <main className="platform-page">
      <header className="platform-page-header">
        <div>
          <h1>플랫폼 관리</h1>
          <p>
            플랫폼별 공개 견적에 표시할
            사업자 정보를 설정한다.
          </p>
        </div>
      </header>

      <section className="platform-list">
        {platformsQuery.data.map(
          (platform) => (
            <article
              key={platform.id}
              className="platform-card"
            >
              <div className="platform-card-header">
                <div>
                  <h2>{platform.name}</h2>
                  <span>{platform.code}</span>
                </div>

                <span
                  className={
                    platform.active
                      ? "platform-status platform-status-active"
                      : "platform-status"
                  }
                >
                  {platform.active
                    ? "사용"
                    : "미사용"}
                </span>
              </div>

              <div className="platform-policy">
                <div className="platform-policy-title">
                  <h3>공개 견적 정보</h3>
                  <p>
                    고객에게 공개되는 견적서의
                    사업자 정보를 설정한다.
                  </p>
                </div>

                <PolicySwitch
                  label="전화번호 공개"
                  checked={
                    platform.showPublicPhone
                  }
                  disabled={
                    updatePolicy.isPending
                  }
                  onChange={(checked) =>
                    handlePolicyChange(
                      platform,
                      "showPublicPhone",
                      checked,
                    )
                  }
                />

                <PolicySwitch
                  label="이메일 공개"
                  checked={
                    platform.showPublicEmail
                  }
                  disabled={
                    updatePolicy.isPending
                  }
                  onChange={(checked) =>
                    handlePolicyChange(
                      platform,
                      "showPublicEmail",
                      checked,
                    )
                  }
                />

                <PolicySwitch
                  label="웹사이트 공개"
                  checked={
                    platform.showPublicWebsite
                  }
                  disabled={
                    updatePolicy.isPending
                  }
                  onChange={(checked) =>
                    handlePolicyChange(
                      platform,
                      "showPublicWebsite",
                      checked,
                    )
                  }
                />

                <PolicySwitch
                  label="주소 공개"
                  checked={
                    platform.showPublicAddress
                  }
                  disabled={
                    updatePolicy.isPending
                  }
                  onChange={(checked) =>
                    handlePolicyChange(
                      platform,
                      "showPublicAddress",
                      checked,
                    )
                  }
                />
              </div>
            </article>
          ),
        )}
      </section>

      {updatePolicy.isError && (
        <div className="platform-error-message">
          공개정보 정책을 저장하지
          못했습니다.
        </div>
      )}
    </main>
  );
}

type PolicySwitchProps = {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

function PolicySwitch({
  label,
  checked,
  disabled,
  onChange,
}: PolicySwitchProps) {
  return (
    <div className="platform-policy-row">
      <span className="platform-policy-label">
        {label}
      </span>

      <label className="platform-switch">
        <input
          type="checkbox"
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