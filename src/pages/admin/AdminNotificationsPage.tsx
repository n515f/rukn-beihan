import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang } from "@/context/LangContext";
import { getUsers, User } from "@/services/usersService";
import { createBulkNotification, createNotification } from "@/services/notificationsService";
import { toast } from "sonner";

const AdminNotificationsPage = () => {
  const { t, lang } = useLang();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [target, setTarget] = useState<"all" | string>("all");
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [messageEn, setMessageEn] = useState("");
  const [messageAr, setMessageAr] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleSend = async () => {
    if (!titleEn || !titleAr) {
      toast.error(t("common.error"));
      return;
    }
    setSending(true);
    try {
      if (target === "all") {
        await createBulkNotification({
          titleEn,
          titleAr,
          messageEn,
          messageAr,
          type: "info",
        });
        toast.success(t("notifications.bulkSentSuccess"));
      } else {
        await createNotification({
          userId: target,
          titleEn,
          titleAr,
          messageEn,
          messageAr,
          type: "info",
        });
        toast.success(t("notifications.sentSuccess"));
      }
      // بث حدث لتحديث قوائم الإشعارات لدى المستخدمين
      window.dispatchEvent(new CustomEvent("notifications-updated"));

      setTitleEn("");
      setTitleAr("");
      setMessageEn("");
      setMessageAr("");
      setTarget("all");
    } catch {
      toast.error(target === "all" ? t("notifications.bulkSentError") : t("notifications.sentError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <AdminPageHeader title={t("admin.notifications")} breadcrumbs={[{ label: t("admin.notifications") }]} />
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.notifications")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("admin.titleEn")}</Label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
            </div>
            <div>
              <Label>{t("admin.titleAr")}</Label>
              <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
            </div>
            <div>
              <Label>{lang === "ar" ? "الرسالة (إنجليزي)" : "Message (English)"} </Label>
              <Input value={messageEn} onChange={(e) => setMessageEn(e.target.value)} />
            </div>
            <div>
              <Label>{lang === "ar" ? "الرسالة (عربي)" : "Message (Arabic)"} </Label>
              <Input value={messageAr} onChange={(e) => setMessageAr(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <Label>{lang === "ar" ? "المرسل إليه" : "Send To"}</Label>
              <Select value={target} onValueChange={(v) => setTarget(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === "ar" ? "جميع المستخدمين" : "All users"}</SelectItem>
                  {!loading &&
                    users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {lang === "ar" ? u.name : u.name} ({u.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={sending}>
                {sending ? t("common.loading") : lang === "ar" ? "إرسال" : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
