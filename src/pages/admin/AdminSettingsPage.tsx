import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLang } from '@/context/LangContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTax } from '@/context/TaxContext';
import { toast } from 'sonner';

const AdminSettingsPage = () => {
  const { t } = useLang();
  const { currency, setCurrency, exchangeRate, setExchangeRate } = useCurrency();
  const { isVatEnabled, setIsVatEnabled, vatPercentage, setVatPercentage } = useTax();

  const [localExchangeRate, setLocalExchangeRate] = useState(exchangeRate.toString());
  const [localVatPercentage, setLocalVatPercentage] = useState(vatPercentage.toString());

  // General settings (mock)
  const [generalSettings, setGeneralSettings] = useState({
    businessNameEn: 'Rukn Beihan Batteries',
    businessNameAr: 'مؤسسة ركن بيحان للبطاريات',
    phone: '053 452 3425',
    hours: '5:30 AM – 12:00 midnight',
    serviceAreas: 'Al Mahdiyah, Dhahrat Laban, Irqah, West Riyadh',
  });

  const handleSaveCurrency = () => {
    const rate = parseFloat(localExchangeRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error(t('currency.invalidRate'));
      return;
    }
    setExchangeRate(rate);
    toast.success(t('admin.settingsSaved'));
  };

  const handleSaveTax = () => {
    const percentage = parseFloat(localVatPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error(t('tax.invalidRate'));
      return;
    }
    setVatPercentage(percentage);
    toast.success(t('tax.saved'));
  };

  const handleSaveGeneral = () => {
    // TODO: Replace with actual API call to backend
    toast.success(t('admin.settingsSaved'));
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title={t('account.settings')}
        breadcrumbs={[{ label: t('account.settings') }]}
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="general">{t('admin.general')}</TabsTrigger>
          <TabsTrigger value="currency">{t('currency.label')}</TabsTrigger>
          <TabsTrigger value="tax">{t('tax.vat')}</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.generalSettings')}</CardTitle>
              <CardDescription>{t('admin.generalSettingsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('admin.businessNameEn')}</Label>
                  <Input
                    value={generalSettings.businessNameEn}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, businessNameEn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.businessNameAr')}</Label>
                  <Input
                    value={generalSettings.businessNameAr}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, businessNameAr: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('common.phone')}</Label>
                <Input
                  value={generalSettings.phone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.workingHours')}</Label>
                <Input
                  value={generalSettings.hours}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, hours: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.serviceAreas')}</Label>
                <Input
                  value={generalSettings.serviceAreas}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, serviceAreas: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveGeneral}>{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>{t('currency.label')} {t('account.settings')}</CardTitle>
              <CardDescription>{t('admin.currencySettingsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{t('currency.activeCurrency')}</Label>
                <RadioGroup
                  value={currency}
                  onValueChange={(value) => setCurrency(value as 'SAR' | 'USD')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="SAR" id="sar" />
                    <Label htmlFor="sar" className="cursor-pointer">
                      {t('currency.sarFull')} (SAR)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <RadioGroupItem value="USD" id="usd" />
                    <Label htmlFor="usd" className="cursor-pointer">
                      {t('currency.usdFull')} (USD)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>{t('currency.exchangeRate')} (SAR → USD)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={localExchangeRate}
                    onChange={(e) => setLocalExchangeRate(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button onClick={handleSaveCurrency}>{t('common.save')}</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  1 USD = {localExchangeRate} SAR
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>{t('tax.vatSettings')}</CardTitle>
              <CardDescription>{t('tax.saudiVatNote')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('tax.enableVat')}</Label>
                  <p className="text-sm text-muted-foreground">{t('tax.enableVatDesc')}</p>
                </div>
                <Switch
                  checked={isVatEnabled}
                  onCheckedChange={setIsVatEnabled}
                />
              </div>

              {isVatEnabled && (
                <div className="space-y-2">
                  <Label>{t('tax.vatPercentage')}</Label>
                  <div className="flex gap-2">
                    <div className="relative max-w-[200px]">
                      <Input
                        type="number"
                        step="0.1"
                        value={localVatPercentage}
                        onChange={(e) => setLocalVatPercentage(e.target.value)}
                      />
                      <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                    <Button onClick={handleSaveTax}>{t('common.save')}</Button>
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{t('tax.preview')}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{t('cart.subtotal')}</span>
                    <span>100.00 SAR</span>
                  </div>
                  {isVatEnabled && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t('tax.vat')} ({localVatPercentage}%)</span>
                      <span>{(100 * parseFloat(localVatPercentage || '0') / 100).toFixed(2)} SAR</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t('cart.total')}</span>
                    <span>{(100 + (isVatEnabled ? 100 * parseFloat(localVatPercentage || '0') / 100 : 0)).toFixed(2)} SAR</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
