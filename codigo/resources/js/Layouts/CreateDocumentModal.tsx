import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, FormEventHandler } from "react";
import InputError from "@/Components/InputError";
import { User } from "@/types";

interface Document {
    id?: number;
    name: string;
    description: string;
    priority: number;
    date_submitted?: string;
    date_approved?: string;
    documents?: File;
    user_id: number;
    username?: string;
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
    const csrfToken = document
    .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
    ?.getAttribute('content');

    const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};

    const [data, setData] = useState({
        name: "",
        description: "",
        priority: 1,
        date_submitted: "",
        date_approved: "",
        user_id: 1,
    });

    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [userList, setUserList] = useState<User[]>([]);


    useEffect(() => {
        fetch("/users",{
            method: "GET",
            headers
        })
        .then((response) => response.json())
        .then((data) => {
            setUserList(data);
        }
        )
    }, []);
    useEffect(() => {
        if (documents) {
            setData({
                name: documents.name || "",
                description: documents.description || "",
                priority: documents.priority || 1,
                date_submitted: documents.date_submitted || "",
                date_approved: documents.date_approved || "",
                user_id: documents.user_id || 1,
            });
        } else {
            setData({
                name: "",
                description: "",
                priority: 1,
                date_submitted: "",
                date_approved: "",
                user_id: 1,
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
        formData.append("user_id", String(data.user_id));
    
        if (file) {
            formData.append("document", file);
        }
    
        if (documents) {
            formData.append("date_submitted", data.date_submitted); 
            formData.append("date_approved", data.date_approved);
            
            fetch("/documents/" + documents.id, {
                method: "POST",
                body: formData,
                headers,
            })
                .then((response) => {
                    if (!response.ok) {
                        return response.json().then((errorData) => {
                            console.log(errorData);
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
    
            return;
        }
    

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
                                        htmlFor="date_submitted"
                                        className="block mb-1"
                                    >
                                        Fecha de Creación:
                                    </label>
                                    <input
                                        type="date"
                                        id="date_submitted"
                                        name="date_submitted"
                                        value={data.date_submitted ? new Date(data.date_submitted).toISOString().substring(0, 10) : ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-100 text-gray-700"
                                    />
                                    <InputError
                                        message={errors.date_submitted}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label
                                        htmlFor="date_approved"
                                        className="block mb-1"
                                    >
                                        Fecha de Aprobación:
                                    </label>
                                    <input
                                        type="date"
                                        id="date_approved"
                                        name="date_approved"
                                        value={data.date_approved ? new Date(data.date_approved).toISOString().substring(0, 10) : ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-gray-100 text-gray-700"
                                    />
                                    <InputError
                                        message={errors.date_approved}
                                        className="mt-2"
                                    />
                                </div>
                            </>
                        )}
                        <div className="mb-4">
                            <label htmlFor="user_id" className="block mb-1">
                                Usuario asignado:
                            </label>
                            <select
                                id="user_id"
                                name="user_id"
                                onChange={handleInputChange}
                                className="w-full p-2 rounded text-primary"
                            >
                                {userList.map((user) => (
                                    <option value={user.id} key={user.id} selected={ user.name === documents?.username}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={errors.user_id}
                                className="mt-2"
                            />
                        </div>

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
