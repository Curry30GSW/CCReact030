import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar Sesión | COOPSERP - Cartera Castigada"
        description="Sistema de gestión de cartera castigada"
      />
      <div className="min-h-screen bg-cover bg-center bg-no-repeat">
        <div className="relative min-h-screen bg-gradient-to-b from-black/40 via-black/30 to-black/40">
          <AuthLayout>
            <SignInForm />
          </AuthLayout>
        </div>
      </div>
    </>
  );
}