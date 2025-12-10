import React, { useState } from "react";
import { Download, Upload, X, FileText, AlertCircle } from "lucide-react";
import AttendanceImportExport from "./AttendanceImportExport";

export default function AttendanceModal({ isOpen, onClose, type }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {type === 'import' ? (
              <Upload className="text-blue-600" size={24} />
            ) : (
              <Download className="text-green-600" size={24} />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {type === 'import' ? 'Import Dữ Liệu Chấm Công' : 'Export Dữ Liệu Chấm Công'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AttendanceImportExport />
        </div>
      </div>
    </div>
  );
}
