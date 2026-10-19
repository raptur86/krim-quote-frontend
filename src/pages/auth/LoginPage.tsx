
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation } from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  loginSchema,
  type LoginFormData,
} from "../../features/auth/schemas/loginSchema";

import { useAuth } from "../../features/auth/useAuth";
import { apiErrorMessage } from "../../services/apiClient";
import { ROUTES } from "../../app/router/routes";

import "./LoginPage.css";

export function LoginPage() {
  const { admin, loading, sessionError, login } = useAuth();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const from: unknown = location.state?.from;

  const destination =
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    from !== ROUTES.login
      ? from
      : ROUTES.dashboard;

  async function onSubmit(data: LoginFormData) {
    if (isSubmitting) return;

    clearErrors("root");

    try {
      await login(data);
    } catch (error) {
      setError("root", {
        message: apiErrorMessage(error),
      });
    }
  }

  if (loading) {
    return (
      <main className="login-page login-page-loading">
        <div className="login-loading-content" role="status">
          <div className="login-loading-mark">K</div>
          <LoaderCircle
            size={25}
            className="login-spinner"
            aria-hidden="true"
          />
          <strong>로그인 상태를 확인하고 있다.</strong>
          <p>관리자 세션을 확인하는 중이다.</p>
        </div>
      </main>
    );
  }

  if (admin) {
    return <Navigate to={destination} replace />;
  }

  return (
    <main className="login-page">
      <div className="login-layout">
        {/* Brand panel */}
        <section
          className="login-brand-panel"
          aria-label="KRIM Quote 소개"
        >
          <div className="login-brand-header">
            <div className="login-brand">
              <span className="login-mark" aria-hidden="true">
                K
              </span>

              <div className="login-brand-name">
                <strong>KRIM</strong>
                <span>QUOTE</span>
              </div>
            </div>

            <span className="login-brand-label">
              BUSINESS MANAGEMENT
            </span>
          </div>

          <div className="login-brand-content">
            <div className="login-brand-eyebrow">
              <span className="login-brand-eyebrow-line" />
              SMART BUSINESS WORKSPACE
            </div>

            <h1>
              견적부터 정산까지,
              <br />
              <span>하나의 흐름으로.</span>
            </h1>

            <p>
              고객 정보부터 프로젝트 견적,
              <br />
              매출과 정산까지 체계적으로 관리한다.
            </p>

            <div className="login-feature-list">
              <div className="login-feature">
                <span className="login-feature-icon">
                  <Users size={19} aria-hidden="true" />
                </span>
                <div>
                  <strong>고객 관리</strong>
                  <span>고객 및 의뢰 정보 통합 관리</span>
                </div>
              </div>

              <div className="login-feature">
                <span className="login-feature-icon">
                  <FileText size={19} aria-hidden="true" />
                </span>
                <div>
                  <strong>견적 관리</strong>
                  <span>표준 단가 기반 견적 작성 및 관리</span>
                </div>
              </div>

              <div className="login-feature">
                <span className="login-feature-icon">
                  <BarChart3 size={19} aria-hidden="true" />
                </span>
                <div>
                  <strong>매출·정산 관리</strong>
                  <span>매출 현황 및 정산 내역 확인</span>
                </div>
              </div>
            </div>
          </div>

          <div className="login-brand-footer">
            <span>KRIM QUOTE</span>
            <span>ESTIMATE & BUSINESS MANAGEMENT</span>
          </div>

          <div
            className="login-brand-decoration login-brand-decoration-one"
            aria-hidden="true"
          />
          <div
            className="login-brand-decoration login-brand-decoration-two"
            aria-hidden="true"
          />
        </section>

        {/* Login panel */}
        <section
          className="login-form-panel"
          aria-labelledby="login-heading"
        >
          <div className="login-form-panel-inner">
            <div className="login-mobile-brand">
              <span className="login-mark" aria-hidden="true">
                K
              </span>
              <strong>KRIM</strong>
              <span>QUOTE</span>
            </div>

            <div className="login-form-header">
              <span className="login-form-eyebrow">
                ADMIN WORKSPACE
              </span>

              <h2 id="login-heading">
                관리자 로그인
              </h2>

              <p>
                KRIM Quote 관리자 계정으로
                로그인한다.
              </p>
            </div>

            <form
              className="login-form"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="login-field">
                <label htmlFor="login-email">
                  이메일
                </label>

                <div
                  className={`login-input-wrap ${
                    errors.email
                      ? "login-input-wrap-error"
                      : ""
                  }`}
                >
                  <Mail
                    size={18}
                    className="login-input-icon"
                    aria-hidden="true"
                  />

                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder="이메일을 입력한다"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email
                        ? "email-error"
                        : undefined
                    }
                    {...register("email")}
                    readOnly={isSubmitting}
                  />
                </div>

                {errors.email && (
                  <p
                    id="email-error"
                    className="login-error"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="login-password">
                  비밀번호
                </label>

                <div
                  className={`login-input-wrap login-password ${
                    errors.password
                      ? "login-input-wrap-error"
                      : ""
                  }`}
                >
                  <LockKeyhole
                    size={18}
                    className="login-input-icon"
                    aria-hidden="true"
                  />

                  <input
                    id="login-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="비밀번호를 입력한다"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password
                        ? "password-error"
                        : undefined
                    }
                    {...register("password")}
                    readOnly={isSubmitting}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    aria-label={
                      showPassword
                        ? "비밀번호 숨기기"
                        : "비밀번호 보기"
                    }
                    aria-pressed={showPassword}
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={19}
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        size={19}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p
                    id="password-error"
                    className="login-error"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {(errors.root?.message || sessionError) && (
                <div
                  className="login-notice"
                  role="alert"
                >
                  <ShieldCheck
                    size={18}
                    aria-hidden="true"
                  />
                  <span>
                    {errors.root?.message || sessionError}
                  </span>
                </div>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="login-spinner"
                      aria-hidden="true"
                    />
                    로그인 중...
                  </>
                ) : (
                  <>
                    로그인
                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="login-security">
              <CheckCircle2
                size={16}
                aria-hidden="true"
              />
              <span>
                등록된 관리자 계정으로 로그인한다.
              </span>
            </div>

            <div className="login-form-footer">
              <span>KRIM QUOTE</span>
              <span>ADMINISTRATION SYSTEM</span>
            </div>
          </div>
        </section>
      </div>

      <small className="login-copyright">
        © {new Date().getFullYear()} KRIM.
        All rights reserved.
      </small>
    </main>
  );
}
