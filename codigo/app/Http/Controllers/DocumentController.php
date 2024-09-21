<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DocumentController extends Controller
{
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
    
            $filePath = $request->file('document')->store('documents', 'public'); 
    
           
    
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
