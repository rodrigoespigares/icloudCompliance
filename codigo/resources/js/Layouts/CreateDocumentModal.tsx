import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, FormEventHandler } from "react";
import InputError from "@/Components/InputError";

interface Document {
    id?: number;
    name: string;
    description: string;
    priority: number;
    created_at?: string;
    approved_at?: string;
    documents?: File;
}

interface CreateDocumentModalProps {
    isVisible: boolean;
    documents?: Document | null;
    onClose: () => void;
    onSave: () => void;
}

export default function CreateDocumentModal({
    isVisible,
    documents,
    onClose,
    onSave,
}: CreateDocumentModalProps) {
    const [data, setData] = useState({
        name: "",
        description: "",
        priority: 1,
        created_at: "",
        approved_at: "",
    });

    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (documents) {
            setData({
                name: documents.name || "",
                description: documents.description || "",
                priority: documents.priority || 1,
                created_at: documents.created_at || "",
                approved_at: documents.approved_at || "",
            });
        } else {
            setData({
                name: "",
                description: "",
                priority: 1,
                created_at: "",
                approved_at: "",
            });
        }
    }, [documents]);

    if (!isVisible) return null;

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const uploadedFile = e.target.files[0];
            setFile(uploadedFile);
            setData({ ...data, name: uploadedFile.name });
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
    
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("priority", String(data.priority));
    
        if (file) {
            formData.append("document", file);
        } else {
            setErrors({ documents: "No se ha seleccionado ningún archivo." });
            setProcessing(false);
            return;
        }

        const csrfToken = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');

        const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
    
        fetch("/documents", {
            method: "POST",
            body: formData,
            headers,
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        setErrors(errorData.errors || {});
                    });
                } else {
                    response.json().then((data) => {
                        onSave();
                        onClose();
                    });
                }
            })
            .catch((error) => {
                console.error("Error en la solicitud:", error);
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="w-[30vw] bg-white py-2 px-4 transition-opacity duration-300 ease-in-out rounded-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold">
                        {documents ? "Editar Documento" : "Crear Documento"}
                    </h1>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                    >
                        <Icon icon="bx:x" />
                    </button>
                </header>
                <main>
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label htmlFor="description" className="block mb-1">
                                Descripción:
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full p-2 rounded text-primary"
                                style={{ resize: "none" }}
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="priority" className="block mb-1">
                                Prioridad:
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={data.priority}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded text-primary"
                            >
                                <option value="1">Baja</option>
                                <option value="2">Media</option>
                                <option value="3">Alta</option>
                            </select>
                            <InputError
                                message={errors.priority}
                                className="mt-2"
                            />
                        </div>

                        {documents && (
                            <>
                                <div className="mb-4">
                                    <label
                                        htmlFor="created_at"
                                        className="block mb-1"
                                    >
                                        Fecha de Creación:
                                    </label>
                                    <input
                                        type="text"
                                        id="created_at"
                                        name="created_at"
                                        value={data.created_at}
                                        readOnly
                                        className="w-full p-2 rounded bg-gray-100 text-gray-700"
                                    />
                                    <InputError
                                        message={errors.created_at}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="approved_at"
                                        className="block mb-1"
                                    >
                                        Fecha de Aprobación:
                                    </label>
                                    <input
                                        type="text"
                                        id="approved_at"
                                        name="approved_at"
                                        value={
                                            data.approved_at || "No Aprobado"
                                        }
                                        readOnly
                                        className="w-full p-2 rounded bg-gray-100 text-gray-700"
                                    />
                                    <InputError
                                        message={errors.approved_at}
                                        className="mt-2"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label
                                htmlFor="document"
                                className="flex items-center justify-center cursor-pointer border border-gray-600 rounded-md p-4 text-gray-600 hover:bg-gray-200"
                            >
                                <Icon
                                    className="text-2xl"
                                    icon="mdi:file-upload-outline"
                                />
                                <span className="ml-2">
                                    {data.name || "Sube tu archivo"}
                                </span>
                            </label>
                            <input
                                type="file"
                                id="document"
                                name="document"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <InputError
                                message={errors.document}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center justify-end mt-2">
                            <button
                                type="submit"
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                disabled={processing}
                            >
                                {documents ? "Actualizar" : "Crear"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}
