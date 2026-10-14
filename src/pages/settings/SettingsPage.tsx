import { Link } from "react-router-dom";
import { ROUTES } from "../../app/router/routes";
import "./SettingsPage.css";

const settingsSections = [
  {
    title: "사업자 정보",
    description: "상호명, 대표자, 연락처, 입금 계좌 및 견적서 로고를 관리한다.",
    path: ROUTES.business,
    action: "사업자 정보 관리",
  },
  {
    title: "사업 원가 설정",
    description: "내부 시간단가, 월 기준 작업시간, 고정비 및 원가 기준 이력을 관리한다.",
    path: ROUTES.costSettings,
    action: "사업 원가 설정",
  },
] as const;

export function SettingsPage() {
  return (
    <main className="settings-page">
      <header className="settings-page__header">
        <h1>설정</h1>
        <p>KRIM Quote 운영에 필요한 사업자 정보와 내부 원가 기준을 관리한다.</p>
      </header>

      <section className="settings-page__section" aria-labelledby="settings-management-title">
        <h2 id="settings-management-title">운영 설정</h2>
        <div className="settings-page__grid">
          {settingsSections.map((section) => (
            <article className="settings-page__card" key={section.path}>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              <Link className="settings-page__link" to={section.path}>
                {section.action} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
