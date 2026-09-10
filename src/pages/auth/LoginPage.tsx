import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation } from "react-router-dom";
import { loginSchema, type LoginFormData } from "../../features/auth/schemas/loginSchema";
import { useAuth } from "../../features/auth/useAuth";
import { apiErrorMessage } from "../../services/apiClient";

import { ROUTES } from "../../app/router/routes";
import "./LoginPage.css";
export function LoginPage() {
  const { admin, loading, sessionError, login } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setError, clearErrors, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" },
  });
  const from: unknown = location.state?.from;
  const destination = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && from !== ROUTES.login ? from : ROUTES.dashboard;
  async function onSubmit(data: LoginFormData) {
    if (isSubmitting) return;
    clearErrors("root");
    try { await login(data); }
    catch (error) { setError("root", { message: apiErrorMessage(error) }); }
  }
  if (loading) return <main className="login-page"><p role="status">로그인 상태를 확인하고 있습니다…</p></main>;
  if (admin) return <Navigate to={destination} replace />;
  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-heading">
        <div className="login-brand"><span className="login-mark" aria-hidden="true">K</span> KRIM <span>QUOTE</span></div>
        <h1 id="login-heading">관리자 로그인</h1>
        <p className="login-description">견적부터 매출까지, 한곳에서 관리하세요.</p>
        <form className="login-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="login-field">
            <label htmlFor="login-email">이메일</label>
            <input id="login-email" type="email" autoComplete="username" placeholder="이메일을 입력해주세요" readOnly={isSubmitting}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} {...register("email")} />
            {errors.email && <p id="email-error" className="login-error">{errors.email.message}</p>}
          </div>
          <div className="login-field">
            <label htmlFor="login-password">비밀번호</label>
            <div className="login-password">
              <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="비밀번호를 입력해주세요" readOnly={isSubmitting}
                aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} {...register("password")} />
              <button type="button" aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "숨기기" : "보기"}</button>
            </div>
            {errors.password && <p id="password-error" className="login-error">{errors.password.message}</p>}
          </div>
          {(errors.root?.message || sessionError) && <p className="login-notice" role="alert">{errors.root?.message || sessionError}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "로그인 중…" : "로그인"}</button>
        </form>
        <p className="login-footer">등록된 관리자 계정으로 로그인해주세요.</p>
      </section>
      <small className="login-copyright">KRIM QUOTE · 견적·매출 관리</small>
    </main>
  );
}
