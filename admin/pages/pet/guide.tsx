import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { toast } from "react-hot-toast";
import { Save, Loader2, ArrowLeft, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/router";
import { settingsService } from "../../src/services";

const SETTING_KEY = "pet_farm_guide";

export default function PetFarmGuide() {
  const router = useRouter();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGuideConfig();
  }, []);

  const fetchGuideConfig = async () => {
    try {
      setLoading(true);
      // Fetch editable settings for the 'pet' group
      const settings = await settingsService.getEditableSettings("pet");
      const guideSetting = settings.find(s => s.key === SETTING_KEY);
      if (guideSetting && guideSetting.value) {
        setContent(guideSetting.value);
        if (editorRef.current) {
          editorRef.current.innerHTML = guideSetting.value;
        }
      }
    } catch (error) {
      console.error("Error fetching pet farm guide:", error);
      toast.error("Không thể tải cấu hình hiện tại");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const currentHtml = editorRef.current?.innerHTML || content;
      await settingsService.update(SETTING_KEY, currentHtml);
      setContent(currentHtml);
      toast.success("Đã cập nhật hướng dẫn Pet Farm thành công");
    } catch (error) {
      console.error("Error saving pet farm guide:", error);
      toast.error("Đã xảy ra lỗi khi lưu hướng dẫn");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Hướng Dẫn Nuôi Vật Nuôi | Admin Dashboard</title>
      </Head>

      <div className="min-h-screen p-6 text-white" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push("/pet")}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  Cấu Hình Hướng Dẫn Nuôi Vật
                </h1>
                <p className="text-purple-200 mt-1">Biên tập nội dung popup hướng dẫn bên phía người dùng</p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium transition-all shadow-lg shadow-purple-500/25 bg-gradient-to-r from-purple-500 hover:from-purple-600 to-pink-500 hover:to-pink-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-purple-300">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="html-editor-wrapper bg-white rounded-xl overflow-hidden text-black flex flex-col border border-gray-300">
                <div className="editor-toolbar bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-2 items-center">
                  <button onClick={() => document.execCommand('bold', false)} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="In đậm"><Bold size={16}/></button>
                  <button onClick={() => document.execCommand('italic', false)} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="In nghiêng"><Italic size={16}/></button>
                  <button onClick={() => document.execCommand('underline', false)} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Gạch chân"><Underline size={16}/></button>
                  <button onClick={() => document.execCommand('strikeThrough', false)} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Gạch ngang"><Strikethrough size={16}/></button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button onClick={() => document.execCommand('insertUnorderedList', false)} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Danh sách"><List size={16}/></button>
                  <button onClick={() => document.execCommand('insertOrderedList', false)} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Danh sách số"><ListOrdered size={16}/></button>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button onClick={() => {
                    const url = prompt('Nhập đường dẫn liên kết:');
                    if (url) document.execCommand('createLink', false, url);
                  }} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Chèn link"><Link size={16}/></button>
                  <button onClick={() => {
                    const url = prompt('Nhập đường dẫn hình ảnh (URL):');
                    if (url) document.execCommand('insertImage', false, url);
                  }} className="p-2 hover:bg-gray-200 rounded text-gray-700" title="Chèn ảnh"><ImageIcon size={16}/></button>
                </div>
                <div
                  ref={editorRef}
                  className="editor-content p-4 min-h-[400px] outline-none focus:ring-2 focus:ring-purple-500/50"
                  contentEditable
                  onBlur={() => {
                    if (editorRef.current) {
                      setContent(editorRef.current.innerHTML);
                    }
                  }}
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    wordBreak: 'break-word',
                    lineHeight: '1.6'
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 text-purple-200 text-sm">
            <p className="font-semibold text-white mb-1">Mẹo soạn thảo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bạn có thể sao chép hình ảnh dán thẳng vào trình soạn thảo.</li>
              <li>Sử dụng các thẻ tiêu đề (Header 1, 2) để bài viết mạc lạc hơn.</li>
              <li>Có thể sử dụng màu nền (Background) để làm nổi bật từ in đậm.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
