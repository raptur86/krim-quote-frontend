import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../../features/auth/schemas/loginSchema";


import "./LoginPage.css";


export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  
  const onSubmit = (data: LoginFormData) => {
    console.log(data);

  };

  return (
    <div>
      <div className="flex flex-column items-center login-container" >
        <h2 className="login-title">Krim(로고) QUOTE</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="login-form">
            <div className="input-group">
              <input type="email" placeholder="이메일" {...register("email")} />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>
            <div className="input-group">
              <input type="password" placeholder="비밀번호" {...register("password")} />
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>
            <div className="input-group">
              <button className="btn btn-primary" type="submit" disabled>
                LOGIN
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}