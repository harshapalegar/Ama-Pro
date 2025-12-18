import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { csvService } from '../services/csvService';
import { Product } from '../types';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (products: Product[]) => Promise<void>;
}

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Product[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'loading'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setStep('loading');

    const result = await csvService.parseCSV(selectedFile);

    if (!result.success) {
      setError(result.error || 'Failed to parse CSV');
      setStep('upload');
      return;
    }

    setPreview(result.preview || []);
    setRowCount(result.rowCount || 0);
    setStep('preview');
  };

  const handleConfirmUpload = async () => {
    if (!file) return;

    setStep('loading');
    const result = await csvService.parseCSV(file);

    if (!result.success || !result.data) {
      setError(result.error || 'Failed to parse CSV');
      setStep('preview');
      return;
    }

    try {
      await onUpload(result.data);
      setFile(null);
      setPreview([]);
      setRowCount(0);
      setError(null);
      onClose();
    } catch (err) {
      setError(`Upload failed: ${String(err)}`);
      setStep('preview');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#16191f]">Import Products from CSV</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} className="text-[#545b64]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <p className="text-sm text-[#545b64]">
                Upload a CSV file with your product data. The file should include columns like: name, price,
                category, rating, reviews, etc.
              </p>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#ec7211] transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-[#545b64] mb-2" />
                <p className="font-medium text-[#16191f]">Click to select CSV file</p>
                <p className="text-xs text-[#545b64] mt-1">or drag and drop your file here</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={e => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && preview.length > 0 && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-start gap-2">
                <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  CSV parsed successfully! Found {rowCount} products. Showing first 10 below.
                </p>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#fafafa] border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 font-bold text-[#545b64]">Name</th>
                      <th className="px-4 py-2 font-bold text-[#545b64]">Price</th>
                      <th className="px-4 py-2 font-bold text-[#545b64]">Category</th>
                      <th className="px-4 py-2 font-bold text-[#545b64]">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map(p => (
                      <tr key={p.id} className="hover:bg-blue-50">
                        <td className="px-4 py-2 truncate text-[#16191f]">{p.name}</td>
                        <td className="px-4 py-2 text-[#16191f]">${p.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-[#545b64] text-xs">{p.category}</td>
                        <td className="px-4 py-2 text-[#16191f]">{p.rating.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <Loader size={32} className="text-[#ec7211] animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#16191f] border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>

          {step === 'preview' && (
            <button
              onClick={handleConfirmUpload}
              className="px-4 py-2 text-sm font-medium text-white bg-[#ec7211] rounded hover:bg-[#eb5f07]"
            >
              Import {rowCount} Products
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
