import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";

export const Login = () => {
  const { mutate: login } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Будь ласка, заповніть всі поля");
      return;
    }

    setIsLoading(true);
    login(
      { email, password },
      {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: (error) => {
          setIsLoading(false);
          setError(error?.message || "Помилка авторізації. Перевірте дані.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Адмін-панель</h1>
          <p className="text-muted-foreground mt-2">
            ПДР України - Система управління
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Вхід до системи</CardTitle>
            <CardDescription>
              Увійдіть використовуючи ваш email та пароль адміністратора
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Вхід...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Увійти
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>Доступ тільки для адміністраторів</p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 ПДР України. Всі права захищені.</p>
        </div>
      </div>
    </div>
  );
};
