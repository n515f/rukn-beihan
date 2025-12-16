import { useState } from 'react';
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLang } from '@/context/LangContext';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  isDefault: boolean;
}

const AddressesPage = () => {
  const { t } = useLang();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      name: 'Ahmed Mohammed',
      phone: '053 452 3425',
      address: 'Al Mahdiyah District, Street 15',
      city: 'Riyadh',
      zipCode: '12345',
      isDefault: true,
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      label: '',
      name: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        zipCode: address.zipCode,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 300));

    if (editingAddress) {
      setAddresses(addresses.map(addr =>
        addr.id === editingAddress.id
          ? { ...addr, ...formData }
          : addr
      ));
      toast.success(t('addresses.updated'));
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
      toast.success(t('addresses.added'));
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    // TODO: Replace with real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success(t('addresses.deleted'));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast.success(t('addresses.setDefault'));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t('addresses.title')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addresses.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? t('addresses.edit') : t('addresses.add')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="label">{t('addresses.label')}</Label>
                <Input
                  id="label"
                  name="label"
                  placeholder="Home, Work, etc."
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">{t('checkout.name')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('checkout.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">{t('checkout.address')}</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t('checkout.city')}</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">{t('checkout.zipCode')}</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingAddress ? t('addresses.update') : t('addresses.save')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">{t('addresses.noAddresses')}</h3>
          <p className="text-muted-foreground mb-6">{t('addresses.addFirst')}</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? 'border-primary' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {address.label}
                    {address.isDefault && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        {t('addresses.default')}
                      </span>
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                  <p className="font-medium text-foreground">{address.name}</p>
                  <p>{address.phone}</p>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.zipCode}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(address)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('common.delete')}
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      {t('addresses.makeDefault')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
