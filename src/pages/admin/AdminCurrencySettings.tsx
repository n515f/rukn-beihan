import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/context/CurrencyContext';
import { useLang } from '@/context/LangContext';
import { toast } from 'sonner';

const AdminCurrencySettings = () => {
  const { currency, setCurrency, exchangeRate, setExchangeRate } = useCurrency();
  const { t } = useLang();

  const handleExchangeRateChange = (value: string) => {
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate > 0) {
      setExchangeRate(rate);
      toast.success(t('common.success'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('currency.label')} {t('account.settings')}</h1>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('currency.activeCurrency')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={currency} onValueChange={(value) => setCurrency(value as 'SAR' | 'USD')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SAR" id="sar" />
                <Label htmlFor="sar" className="cursor-pointer">
                  {t('currency.sarFull')} ({t('currency.sar')})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USD" id="usd" />
                <Label htmlFor="usd" className="cursor-pointer">
                  {t('currency.usdFull')} ({t('currency.usd')})
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('currency.exchangeRate')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rate">{t('currency.exchangeRate')} (SAR per 1 USD)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => handleExchangeRateChange(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                1 USD = {exchangeRate} SAR
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCurrencySettings;
