import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../src/components/layout/Layout";
import ProfileLayout from "../../src/components/profile/ProfileLayout";
import { storage } from "../../src/utils/storage";
import { MapPin, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { addressService, Address } from "../../src/services";
import { ghnService } from "../../src/services/ghn.service";

export default function ProfileAddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null,
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null,
  );

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    ward: "",
    wardCode: "",
    district: "",
    districtId: null as number | null,
    city: "",
    provinceId: null as number | null,
    isDefault: false,
    note: "",
  });

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    loadAddresses();
    loadProvinces();
  }, [router]);

  const loadProvinces = async () => {
    try {
      const data = await ghnService.getProvinces();
      setProvinces(data || []);
    } catch (error) {
      console.error("Failed to load provinces:", error);
    }
  };

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data || []);
    } catch (error: any) {
      console.error("Failed to load addresses:", error);
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    if (!value) {
      setSelectedProvinceId(null);
      setDistricts([]);
      setWards([]);
      setAddressForm((prev) => ({
        ...prev,
        city: "",
        provinceId: null,
        district: "",
        districtId: null,
        ward: "",
        wardCode: "",
      }));
      return;
    }

    const provinceId = Number(value);
    const province = provinces.find((p) => p.ProvinceID === provinceId);
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
    setWards([]);

    setAddressForm((prev) => ({
      ...prev,
      city: province?.ProvinceName || "",
      provinceId: provinceId,
      district: "",
      districtId: null,
      ward: "",
      wardCode: "",
    }));

    try {
      const data = await ghnService.getDistricts(provinceId);
      setDistricts(data || []);
    } catch (error) {
      console.error("Failed to load districts:", error);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    if (!value) {
      setSelectedDistrictId(null);
      setWards([]);
      setAddressForm((prev) => ({
        ...prev,
        district: "",
        districtId: null,
        ward: "",
        wardCode: "",
      }));
      return;
    }

    const districtId = Number(value);
    const district = districts.find((d) => d.DistrictID === districtId);
    setSelectedDistrictId(districtId);

    setAddressForm((prev) => ({
      ...prev,
      district: district?.DistrictName || "",
      districtId: districtId,
      ward: "",
      wardCode: "",
    }));

    try {
      const data = await ghnService.getWards(districtId);
      setWards(data || []);
    } catch (error) {
      console.error("Failed to load wards:", error);
    }
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const ward = wards.find((w: any) => w.WardCode === value);
    setAddressForm((prev) => ({
      ...prev,
      ward: ward?.WardName || "",
      wardCode: value || "",
    }));
  };

  const handleSave = async () => {
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.address ||
      !addressForm.city ||
      !addressForm.provinceId ||
      !addressForm.districtId ||
      !addressForm.wardCode
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setSaving(true);
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, addressForm);
        toast.success("Đã cập nhật địa chỉ");
      } else {
        await addressService.createAddress(addressForm);
        toast.success("Đã thêm địa chỉ mới");
      }
      await loadAddresses();
      setShowAddAddressForm(false);
      setEditingAddressId(null);
      resetForm();
    } catch (error: any) {
      console.error("Failed to save address:", error);
      toast.error(
        error?.response?.data?.message || "Không thể lưu địa chỉ",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      await addressService.deleteAddress(id);
      toast.success("Đã xóa địa chỉ");
      await loadAddresses();
    } catch (error: any) {
      console.error("Failed to delete address:", error);
      toast.error("Không thể xóa địa chỉ");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      toast.success("Đã đặt làm địa chỉ mặc định");
      await loadAddresses();
    } catch (error: any) {
      console.error("Failed to set default address:", error);
      toast.error("Không thể đặt địa chỉ mặc định");
    }
  };

  const resetForm = () => {
    setAddressForm({
      fullName: "",
      phone: "",
      address: "",
      ward: "",
      wardCode: "",
      district: "",
      districtId: null,
      city: "",
      provinceId: null,
      isDefault: false,
      note: "",
    });
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setDistricts([]);
    setWards([]);
  };

  const handleEdit = (addr: Address) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      ward: addr.ward || "",
      wardCode: addr.wardCode || "",
      district: addr.district || "",
      districtId: addr.districtId || null,
      city: addr.city,
      provinceId: addr.provinceId || null,
      isDefault: addr.isDefault,
      note: addr.note || "",
    });
    setSelectedProvinceId(addr.provinceId || null);
    setSelectedDistrictId(addr.districtId || null);

    if (addr.provinceId) {
      ghnService.getDistricts(addr.provinceId).then((data) => {
        setDistricts(data || []);
        if (addr.districtId) {
          ghnService.getWards(addr.districtId).then((wardData) => {
            setWards(wardData || []);
          });
        }
      });
    }

    setShowAddAddressForm(true);
  };

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Địa chỉ giao hàng - Labubu Store</title>
        </Head>
        <ProfileLayout>
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
          </div>
        </ProfileLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Địa chỉ giao hàng - Labubu Store</title>
      </Head>
      <ProfileLayout>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Địa chỉ giao hàng
            </h2>
            <button
              onClick={() => {
                setShowAddAddressForm(true);
                setEditingAddressId(null);
                resetForm();
              }}
              className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm địa chỉ mới
            </button>
          </div>

          {showAddAddressForm && (
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAddressId
                  ? "Chỉnh sửa địa chỉ"
                  : "Thêm địa chỉ mới"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    type="text"
                    value={addressForm.address}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Số nhà, tên đường"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    value={selectedProvinceId ? String(selectedProvinceId) : ""}
                    onChange={handleProvinceChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    {provinces.map((p: any) => (
                      <option key={p.ProvinceID} value={p.ProvinceID}>
                        {p.ProvinceName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện *
                  </label>
                  <select
                    value={
                      selectedDistrictId ? String(selectedDistrictId) : ""
                    }
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((d: any) => (
                      <option key={d.DistrictID} value={d.DistrictID}>
                        {d.DistrictName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã *
                  </label>
                  <select
                    value={addressForm.wardCode}
                    onChange={handleWardChange}
                    disabled={!selectedDistrictId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((w: any) => (
                      <option key={w.WardCode} value={w.WardCode}>
                        {w.WardName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={addressForm.note}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        note: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ghi chú (nếu có)"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Đặt làm địa chỉ mặc định
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : editingAddressId ? (
                    "Cập nhật"
                  ) : (
                    "Thêm địa chỉ"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddAddressForm(false);
                    setEditingAddressId(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {addr.fullName}
                      </h3>
                      {addr.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">📞 {addr.phone}</p>
                    <p className="text-sm text-gray-700">
                      {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                    </p>
                    {addr.note && (
                      <p className="text-sm text-gray-500 mt-1">
                        Ghi chú: {addr.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Đặt làm mặc định"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(addr)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {addresses.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ nào</p>
              <button
                onClick={() => {
                  setShowAddAddressForm(true);
                  resetForm();
                }}
                className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Thêm địa chỉ đầu tiên
              </button>
            </div>
          )}
        </div>
      </ProfileLayout>
    </Layout>
  );
}
