<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DocumentController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $documents = Document::where('status', 1)
            ->get(['id', 'name', 'date_submitted', 'date_approved', 'priority', 'user_id'])
            ->map(function ($document) {
                $document->detail = route('documents.show', $document->id);
                return $document;
            })
            ->groupBy(function ($document) {
                return $document->priority;
            });

        $groupedDocuments = $documents->flatMap(function ($group) {
            return $group;
        });
        
        if ($user->permissions === 0) {
            Log::info('Todos los documentos:', $groupedDocuments->toArray());
            $groupedDocuments = $groupedDocuments->filter(function($document) use ($user) {
                return $document->user_id === $user->id;
            });
        }

        $groupedDocuments = $groupedDocuments->map(function($document) {
            unset($document->user_id); 
            return $document;
        });


        return response()->json($groupedDocuments);
    }

    public function show(String $id)
{
    $document = Document::with('user')->findOrFail($id);

    $document->username = $document->user->name;
    unset($document->user_id);

    return response()->json($document);
}

    public function stats(){
        // Get all documents active
        $documents = Document::where('status', 1)->get();
    
        return Inertia::render('Graficos', [
            'documents' => $documents
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
            $validatedData = $request->validate([
                'name' => 'required|string|max:50',
                'description' => 'required|string|max:255',
                'priority' => 'required|integer|min:1|max:3',
                'document' => 'required|file|mimes:pdf,doc,docx',
                'user_id' => 'required|integer|exists:users,id',
            ]);
    
            $filePath = $request->file('document')->store('documents'); 
    
           
    
            $document = Document::create([
                'name' => $validatedData['name'],
                'description' => $validatedData['description'],
                'priority' => (int)$validatedData['priority'],
                'date_approved' => null,
                'date_submitted' => now(),
                'url' => $filePath, 
                'user_id' => (int)$validatedData['user_id'],
            ]);
    
            return response()->json($document, 201);
        }catch (ValidationException $e){
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        }catch (Exception $e){
            return response()->json($e->getMessage(), 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, String $id)
    {
        try{
            $validatedData = $request->validate([
                'name' => 'string|max:50|min:1',
                'description' => 'string|max:255|min:1',
                'priority' => 'integer|min:1|max:3',
                'document' => 'nullable|file|mimes:pdf,doc,docx',
                'user_id' => 'required|integer|exists:users,id',
                'date_submitted' => 'required|date',
                'date_approved' => 'nullable|date',
            ]);
            
    
    
            $document = Document::findOrFail($id);
    
            
            if($request->hasFile('document')){
                $filePath = $request->file('document')->store('documents'); 
                $document->url = $filePath;
            }
    
            $document->name = $validatedData['name'];
            $document->description = $validatedData['description'];
            $document->priority = (int)$validatedData['priority'];
            $document->user_id = (int)$validatedData['user_id'];
            $document->date_submitted = $validatedData['date_submitted'];
            $document->date_approved = $validatedData['date_approved'];
            $document->save();
    
            return response()->json($document);
        }catch (ValidationException $e){
            return response()->json([
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(String $id)
    {
        $document = Document::findOrFail($id);
        $document->status = 0;
        $document->save();
        return response()->json($document);
    }


    /**
     * Approve the specified resource in storage.
     */
    public function approve(String $id)
    {
        $document = Document::findOrFail($id);
        $document->status = 1;
        $document->date_approved = now();
        $document->save();
        return response()->json($document);
    }
}
