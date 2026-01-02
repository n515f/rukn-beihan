import { useState, useEffect } from 'react';
import { MapPin, Map, Edit3, Navigation, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLang } from '@/context/LangContext';
import { toast } from 'sonner';

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
  const [locationType, setLocationType] = useState<'map' | 'custom'>('map');
  const [mapLink, setMapLink] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [customAddress, setCustomAddress] = useState({
    address: '',
    city: '',
    zipCode: '',
  });

  // Extract coordinates from link or use raw link if not parseable
  useEffect(() => {
    if (!mapLink) {
      setEmbedUrl('');
      return;
    }

    // Try to find lat,lng in the link
    // Patterns: @lat,lng or q=lat,lng
    const latLngRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qLatLngRegex = /q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    
    let match = mapLink.match(latLngRegex) || mapLink.match(qLatLngRegex);
    
    if (match) {
      const lat = match[1];
      const lng = match[2];
      setEmbedUrl(`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`);
    } else {
      // Fallback: search by query if it's not a coordinate link but has some text?
      // It's safer not to show anything if we can't parse coordinates to avoid showing world map
      // But we can try to use the whole string as query
      // NOTE: This might not work well for all links, but "q=" usually works
       setEmbedUrl(`https://maps.google.com/maps?q=${encodeURIComponent(mapLink)}&z=15&output=embed`);
    }
  }, [mapLink]);

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
    onLocationChange({ type: 'map', ...updated });
  };

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error(t('location.geolocationNotSupported') || "Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setMapLink(link);
        onLocationChange({ type: 'map', mapLink: link });
        setIsLocating(false);
        toast.success(t('location.locationFound') || "Location found!");
      },
      (error) => {
        console.error(error);
        toast.error(t('location.locationError') || "Unable to retrieve your location");
        setIsLocating(false);
      }
    );
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
          <div className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${locationType === 'map' ? 'bg-muted/50 border-primary' : 'hover:bg-muted/50'}`}>
            <RadioGroupItem value="map" id="map" />
            <Label htmlFor="map" className="flex items-center gap-2 cursor-pointer flex-1">
              <Map className="h-5 w-5 text-primary" />
              <span className="font-medium">{t('location.useMap')}</span>
            </Label>
          </div>

          {locationType === 'map' && (
            <div className="pl-8 space-y-4">
              {/* Map Preview */}
              <div className="relative h-64 bg-muted rounded-lg overflow-hidden border">
                {embedUrl ? (
                  <iframe 
                    src={embedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    title={t('location.mapPreview') || "Map preview"}
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-muted-foreground">
                    <Map className="h-12 w-12 opacity-20" />
                    <p className="text-sm">{t('location.mapPlaceholder')}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder={t('location.mapLinkPlaceholder')}
                  value={mapLink}
                  onChange={(e) => handleMapLinkChange(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  <span className="sr-only md:not-sr-only md:ml-2">
                    {t('location.locateMe') || "Locate Me"}
                  </span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('location.mapHelp') || "Paste a Google Maps link or use the locate button to find your address."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">{t('checkout.address')}</Label>
                  <Input
                    id="address"
                    value={customAddress.address}
                    onChange={(e) => handleCustomAddressChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">{t('checkout.city')}</Label>
                  <Input
                    id="city"
                    value={customAddress.city}
                    onChange={(e) => handleCustomAddressChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">{t('checkout.zipCode')}</Label>
                  <Input
                    id="zipCode"
                    value={customAddress.zipCode}
                    onChange={(e) => handleCustomAddressChange('zipCode', e.target.value)}
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
