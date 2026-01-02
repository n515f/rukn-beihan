import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/context/LangContext';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import ThemeToggle from '@/components/layout/ThemeToggle';

const SettingsPage = () => {
  const { t } = useLang();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('account.settings')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('account.settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('common.language')}</p>
                  <p className="text-sm text-muted-foreground">{t('common.changeLanguage')}</p>
                </div>
                <LanguageSwitcher />
              </div>
            </div>

            {/* Theme */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('common.theme')}</p>
                  <p className="text-sm text-muted-foreground">{t('common.changeTheme')}</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;