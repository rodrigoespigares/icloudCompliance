import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Document } from '@/types';


export default function Dashboard({ documents = [] }: { documents?: Document[] }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Home</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-3 lg:px-8">

                    <div className="mt-1 p-3 rounded-md bg-white">
                        <h3 className="font-semibold text-lg">Documentos:</h3>
                        <ul>
                            {documents && documents.length > 0 ? (
                                documents.map((document) => (
                                    <li key={document.id}>
                                        {document.name} - {new Date(document.date_submitted).toLocaleDateString()}
                                    </li>
                                ))
                            ) : (
                                <li>No hay documentos disponibles.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}