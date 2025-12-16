import { useState } from 'react';
import { MapPin, Map, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLang } from '@/context/LangContext';

interface LocationSelectorProps {
  onLocationChange: (location: {
    type: 'map' | 'custom';
    mapLink?: string;
    address?: string;
    city?: string;
    zipCode?: string;
  }) => void;
}

const LocationSelector = ({ onLocationChange }: LocationSelectorProps) => {
  const { t } = useLang();
  const [locationType, setLocationType] = useState<'map' | 'custom'>('custom');
  const [mapLink, setMapLink] = useState('');
  const [customAddress, setCustomAddress] = useState({
    address: '',
    city: '',
    zipCode: '',
  });

  const handleLocationTypeChange = (value: 'map' | 'custom') => {
    setLocationType(value);
    if (value === 'map') {
      onLocationChange({ type: 'map', mapLink });
    } else {
      onLocationChange({ type: 'custom', ...customAddress });
    }
  };

  const handleMapLinkChange = (value: string) => {
    setMapLink(value);
    onLocationChange({ type: 'map', mapLink: value });
  };

  const handleCustomAddressChange = (field: string, value: string) => {
    const updated = { ...customAddress, [field]: value };
    setCustomAddress(updated);
    onLocationChange({ type: 'custom', ...updated });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        {t('location.deliveryLocation')}
      </h2>

      <RadioGroup value={locationType} onValueChange={handleLocationTypeChange} className="space-y-4">
        {/* Google Maps Option */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="map" id="map" />
            <Label htmlFor="map" className="flex items-center gap-2 cursor-pointer flex-1">
              <Map className="h-5 w-5 text-primary" />
              <span className="font-medium">{t('location.useMap')}</span>
            </Label>
          </div>

          {locationType === 'map' && (
            <div className="pl-8 space-y-4">
              {/* Map Placeholder - TODO: Replace with real Google Maps integration */}
              <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-muted-foreground">
                  <Map className="h-12 w-12" />
                  <p className="text-sm">{t('location.mapPlaceholder')}</p>
                </div>
                {/* TODO: Integrate Google Maps API here */}
                {/* <iframe 
                  src="https://www.google.com/maps/embed?..." 
                  className="w-full h-full"
                  loading="lazy"
                /> */}
              </div>

              <div>
                <Label>{t('location.pasteLink')}</Label>
                <Input
                  placeholder={t('location.mapLinkPlaceholder')}
                  value={mapLink}
                  onChange={(e) => handleMapLinkChange(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Custom Address Option */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer flex-1">
              <Edit3 className="h-5 w-5 text-primary" />
              <span className="font-medium">{t('location.customAddress')}</span>
            </Label>
          </div>

          {locationType === 'custom' && (
            <div className="pl-8 space-y-4">
              <div>
                <Label htmlFor="address">{t('checkout.address')}</Label>
                <Input
                  id="address"
                  value={customAddress.address}
                  onChange={(e) => handleCustomAddressChange('address', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t('checkout.city')}</Label>
                  <Input
                    id="city"
                    value={customAddress.city}
                    onChange={(e) => handleCustomAddressChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">{t('checkout.zipCode')}</Label>
                  <Input
                    id="zipCode"
                    value={customAddress.zipCode}
                    onChange={(e) => handleCustomAddressChange('zipCode', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </RadioGroup>
    </Card>
  );
};

export default LocationSelector;
