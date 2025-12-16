import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useLang } from '@/context/LangContext';
import { useTax } from '@/context/TaxContext';
import { toast } from 'sonner';

const AdminTaxSettings = () => {
  const { t } = useLang();
  const { isVatEnabled, setIsVatEnabled, vatPercentage, setVatPercentage } = useTax();
  const [tempPercentage, setTempPercentage] = useState(vatPercentage.toString());

  const handleSave = () => {
    const newRate = parseFloat(tempPercentage);
    if (isNaN(newRate) || newRate < 0 || newRate > 100) {
      toast.error(t('tax.invalidRate'));
      return;
    }
    setVatPercentage(newRate);
    toast.success(t('tax.saved'));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('tax.settings')}</h1>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('tax.vatSettings')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* VAT Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{t('tax.enableVat')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('tax.enableVatDesc')}
                </p>
              </div>
              <Switch
                checked={isVatEnabled}
                onCheckedChange={setIsVatEnabled}
              />
            </div>

            {/* VAT Percentage */}
            <div className="space-y-2">
              <Label htmlFor="vatPercentage">{t('tax.vatPercentage')}</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="vatPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tempPercentage}
                  onChange={(e) => setTempPercentage(e.target.value)}
                  className="max-w-[200px]"
                  disabled={!isVatEnabled}
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('tax.saudiVatNote')}
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">{t('tax.preview')}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}</span>
                  <span>100.00 SAR</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>{t('tax.vat')} ({isVatEnabled ? tempPercentage : 0}%)</span>
                  <span>{isVatEnabled ? (100 * parseFloat(tempPercentage || '0') / 100).toFixed(2) : '0.00'} SAR</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>{t('cart.total')}</span>
                  <span>{isVatEnabled ? (100 + 100 * parseFloat(tempPercentage || '0') / 100).toFixed(2) : '100.00'} SAR</span>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full">
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTaxSettings;
