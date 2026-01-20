import { useEffect, useMemo, useState } from "react";
import { ghnService, type GhnDistrict, type GhnProvince, type GhnWard } from "src/services/ghn.service";

type SenderValueChange = (key: string, value: any) => void;

const SENDER_KEYS = {
  address: "GHN_SENDER_ADDRESS",
  provinceId: "GHN_SENDER_PROVINCE_ID",
  provinceName: "GHN_SENDER_PROVINCE_NAME",
  districtId: "GHN_SENDER_DISTRICT_ID",
  districtName: "GHN_SENDER_DISTRICT_NAME",
  wardCode: "GHN_SENDER_WARD_CODE",
  wardName: "GHN_SENDER_WARD_NAME",
} as const;

export default function GhnSenderAddress({
  values,
  onChange,
}: {
  values: Record<string, any>;
  onChange: SenderValueChange;
}) {
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);

  const selectedProvinceId = useMemo(() => {
    const raw = values[SENDER_KEYS.provinceId];
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [values]);

  const selectedDistrictId = useMemo(() => {
    const raw = values[SENDER_KEYS.districtId];
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [values]);

  const selectedWardCode = useMemo(() => {
    const raw = values[SENDER_KEYS.wardCode];
    return raw ? String(raw) : "";
  }, [values]);

  useEffect(() => {
    ghnService.getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }
    ghnService.getDistricts(selectedProvinceId).then(setDistricts).catch(() => setDistricts([]));
  }, [selectedProvinceId]);

  useEffect(() => {
    if (!selectedDistrictId) {
      setWards([]);
      return;
    }
    ghnService.getWards(selectedDistrictId).then(setWards).catch(() => setWards([]));
  }, [selectedDistrictId]);

  return (
    <div className="mb-8 rounded-xl border border-purple-500/30 bg-white/5 p-5 backdrop-blur-sm">
      <div className="mb-4">
        <div className="text-sm font-semibold text-purple-200">Địa chỉ gửi hàng (GHN)</div>
        <div className="mt-1 text-xs text-purple-300">
          Chọn đúng Tỉnh/Quận/Phường theo GHN để tạo đơn GHN hợp lệ.
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-purple-200">
            Địa chỉ
            <span className="ml-1 text-red-400">*</span>
          </label>
          <input
            type="text"
            value={values[SENDER_KEYS.address] || ""}
            onChange={(e) => onChange(SENDER_KEYS.address, e.target.value)}
            placeholder="Số nhà, tên đường..."
            className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white placeholder-purple-300 backdrop-blur-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-200">
              Tỉnh/Thành
              <span className="ml-1 text-red-400">*</span>
            </label>
            <select
              value={selectedProvinceId ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  onChange(SENDER_KEYS.provinceId, "");
                  onChange(SENDER_KEYS.provinceName, "");
                  onChange(SENDER_KEYS.districtId, "");
                  onChange(SENDER_KEYS.districtName, "");
                  onChange(SENDER_KEYS.wardCode, "");
                  onChange(SENDER_KEYS.wardName, "");
                  return;
                }
                const provinceId = Number(value);
                const province = provinces.find((p) => p.ProvinceID === provinceId);
                onChange(SENDER_KEYS.provinceId, String(provinceId));
                onChange(SENDER_KEYS.provinceName, province?.ProvinceName || "");
                onChange(SENDER_KEYS.districtId, "");
                onChange(SENDER_KEYS.districtName, "");
                onChange(SENDER_KEYS.wardCode, "");
                onChange(SENDER_KEYS.wardName, "");
              }}
              className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white backdrop-blur-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="" className="bg-gray-900">
                Chọn tỉnh/thành...
              </option>
              {provinces.map((p) => (
                <option key={p.ProvinceID} value={p.ProvinceID} className="bg-gray-900">
                  {p.ProvinceName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-200">
              Quận/Huyện
              <span className="ml-1 text-red-400">*</span>
            </label>
            <select
              value={selectedDistrictId ?? ""}
              disabled={!selectedProvinceId}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  onChange(SENDER_KEYS.districtId, "");
                  onChange(SENDER_KEYS.districtName, "");
                  onChange(SENDER_KEYS.wardCode, "");
                  onChange(SENDER_KEYS.wardName, "");
                  return;
                }
                const districtId = Number(value);
                const district = districts.find((d) => d.DistrictID === districtId);
                onChange(SENDER_KEYS.districtId, String(districtId));
                onChange(SENDER_KEYS.districtName, district?.DistrictName || "");
                onChange(SENDER_KEYS.wardCode, "");
                onChange(SENDER_KEYS.wardName, "");
              }}
              className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white backdrop-blur-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" className="bg-gray-900">
                Chọn quận/huyện...
              </option>
              {districts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID} className="bg-gray-900">
                  {d.DistrictName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-200">
              Phường/Xã
              <span className="ml-1 text-red-400">*</span>
            </label>
            <select
              value={selectedWardCode}
              disabled={!selectedDistrictId}
              onChange={(e) => {
                const value = e.target.value;
                const ward = wards.find((w) => w.WardCode === value);
                onChange(SENDER_KEYS.wardCode, value || "");
                onChange(SENDER_KEYS.wardName, ward?.WardName || "");
              }}
              className="w-full rounded-lg border border-purple-500/30 bg-white/10 px-4 py-2 text-white backdrop-blur-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" className="bg-gray-900">
                Chọn phường/xã...
              </option>
              {wards.map((w) => (
                <option key={w.WardCode} value={w.WardCode} className="bg-gray-900">
                  {w.WardName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

