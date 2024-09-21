<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
    
        // Get permissions based on user permissions
        $permissions = match ($user->permissions) {
            2 => ["can_see", "can_create", "can_edit", "can_delete"],
            1 => ["can_see", "can_create"],
            0 => ["can_see"],
            default => [],
        };
    
        // Get all documents active
        $documents = Document::where('status', 1)->get();
    
        // If users permissions is 0, filter the documents by user id
        if ($user->permissions === 0) {
            $documents = $documents->filter(function($document) use ($user) {
                return $document->user_id == $user->id;
            });
        }
    
        return Inertia::render('Dashboard', [
            'documents' => $documents,
            'permissions' => $permissions
        ]);
    }
    public function indexJson()
    {
        $documents = Document::where('status', 1)
            ->get(['id', 'name', 'date_submitted', 'date_approved', 'priority'])
            ->map(function ($document) {
                $document->detail = route('documents.show', $document->id);
                return $document;
            })
            ->groupBy(function ($document) {
                return $document->priority === 1 ? 'Prioridad Baja' :
                    ($document->priority === 2 ? 'Prioridad Media' : 'Prioridad Alta');
            });

        return response()->json($documents);
    }

    public function documents()
    {
        $user = Auth::user();
    
        // Get all documents active
        $documents = Document::where('status', 1)->get();
    
        // If users permissions is 0, filter the documents by user id
        if ($user->permissions === 0) {
            $documents = $documents->filter(function($document) use ($user) {
                return $document->user_id == $user->id;
            });
        }
    
        return response()->json($documents);
    }

    public function showJson(String $id)
    {
        $document = Document::findOrFail($id);

        return response()->json($document);
    }

    public function stats(){
        $user = Auth::user();
    
        // Get all documents active
        $documents = Document::where('status', 1)->get();
    
        return Inertia::render('Graficos', [
            'documents' => $documents
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'required|string|max:255',
            'priority' => 'required|integer|min:1|max:3',
            'document' => 'required|file|mimes:pdf,doc,docx',
        ]);

        $filePath = $request->file('document')->store('documents'); 

       

        $document = Document::create([
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'priority' => (int)$validatedData['priority'],
            'date_approved' => null,
            'date_submitted' => now(),
            'url' => $filePath, 
            'user_id' => Auth::user()->id,
        ]);

        return response()->json($document, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Document $document)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Document $document)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Document $document)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Document $document)
    {
        //
    }
}
