'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GENERATE_ESSAY_MUTATION,
  GENERATE_MULTIPLE_VARIANTS_MUTATION,
  GENERATE_OUTLINE_MUTATION,
} from '@/lib/graphql/mutations';

interface EssayGeneratorProps {
  onEssayGenerated?: (essay: string, wordCount: number) => void;
}

export function EssayGenerator({ onEssayGenerated }: EssayGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [wordLimit, setWordLimit] = useState<number>(500);
  const [scholarshipMission, setScholarshipMission] = useState('');
  const [essayType, setEssayType] = useState<string>('personal');
  const [generationMethod, setGenerationMethod] = useState<string>('single_draft');
  const [variantCount, setVariantCount] = useState(3);

  const [generatedEssay, setGeneratedEssay] = useState('');
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [outline, setOutline] = useState('');
  const [error, setError] = useState('');

  const [generateEssay, { loading: generatingEssay }] = useMutation(GENERATE_ESSAY_MUTATION, {
    onCompleted: (data) => {
      setGeneratedEssay(data.generateEssay.essay);
      setVariants(data.generateEssay.variants || []);
      setError('');
      if (onEssayGenerated) {
        onEssayGenerated(data.generateEssay.essay, data.generateEssay.wordCount);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const [generateVariants, { loading: generatingVariants }] = useMutation(
    GENERATE_MULTIPLE_VARIANTS_MUTATION,
    {
      onCompleted: (data) => {
        setGeneratedEssay(data.generateMultipleVariants.essay);
        setVariants(data.generateMultipleVariants.variants || []);
        setSelectedVariant(0);
        setError('');
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const [generateOutlineMutation, { loading: generatingOutline }] = useMutation(
    GENERATE_OUTLINE_MUTATION,
    {
      onCompleted: (data) => {
        setOutline(data.generateOutline.outline);
        setError('');
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const handleGenerate = () => {
    setError('');
    setGeneratedEssay('');
    setVariants([]);
    setOutline('');

    if (!prompt.trim()) {
      setError('Please enter an essay prompt');
      return;
    }

    const input = {
      prompt,
      wordLimit: wordLimit || undefined,
      scholarshipMission: scholarshipMission || undefined,
      essayType: essayType || undefined,
      generationMethod: generationMethod || undefined,
    };

    if (generationMethod === 'multiple_variants') {
      generateVariants({
        variables: { input, count: variantCount },
      });
    } else if (generationMethod === 'outline_first') {
      generateOutlineMutation({ variables: { input } });
    } else {
      generateEssay({ variables: { input } });
    }
  };

  const handleSelectVariant = (index: number) => {
    setSelectedVariant(index);
    if (variants[index]) {
      setGeneratedEssay(variants[index].essay);
      if (onEssayGenerated) {
        onEssayGenerated(variants[index].essay, variants[index].wordCount);
      }
    }
  };

  const handleGenerateFromOutline = () => {
    // After outline is approved, generate essay
    const input = {
      prompt: `${prompt}\n\nFollow this outline:\n${outline}`,
      wordLimit: wordLimit || undefined,
      scholarshipMission: scholarshipMission || undefined,
      essayType: essayType || undefined,
      generationMethod: 'single_draft',
    };

    generateEssay({ variables: { input } });
  };

  const wordCount = generatedEssay.trim().split(/\s+/).filter(Boolean).length;
  const loading = generatingEssay || generatingVariants || generatingOutline;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Essay Generation Settings</CardTitle>
          <CardDescription>Configure your essay prompt and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Essay Prompt *</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste the scholarship essay prompt here..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wordLimit">Word Limit</Label>
              <Input
                id="wordLimit"
                type="number"
                value={wordLimit}
                onChange={(e) => setWordLimit(parseInt(e.target.value))}
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="essayType">Essay Type</Label>
              <Select value={essayType} onValueChange={setEssayType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scholarshipMission">Scholarship Mission (Optional)</Label>
            <Textarea
              id="scholarshipMission"
              value={scholarshipMission}
              onChange={(e) => setScholarshipMission(e.target.value)}
              placeholder="What is the scholarship's mission or focus?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="generationMethod">Generation Method</Label>
            <Select value={generationMethod} onValueChange={setGenerationMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_draft">Single Draft</SelectItem>
                <SelectItem value="multiple_variants">Multiple Variants</SelectItem>
                <SelectItem value="outline_first">Outline First</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {generationMethod === 'single_draft' && 'Generate one essay, then refine'}
              {generationMethod === 'multiple_variants' && 'Generate multiple versions to choose from'}
              {generationMethod === 'outline_first' && 'Create outline first, then write'}
            </p>
          </div>

          {generationMethod === 'multiple_variants' && (
            <div className="space-y-2">
              <Label htmlFor="variantCount">Number of Variants (2-5)</Label>
              <Input
                id="variantCount"
                type="number"
                min={2}
                max={5}
                value={variantCount}
                onChange={(e) => setVariantCount(parseInt(e.target.value))}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Generate Essay'}
          </Button>
        </CardContent>
      </Card>

      {/* Outline Display */}
      {outline && !generatedEssay && (
        <Card>
          <CardHeader>
            <CardTitle>Essay Outline</CardTitle>
            <CardDescription>Review and approve this outline before generating the essay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
              {outline}
            </div>
            <Button onClick={handleGenerateFromOutline} className="w-full">
              Generate Essay from Outline
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Variants Selection */}
      {variants.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Variant</CardTitle>
            <CardDescription>Choose the version you like best</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {variants.map((variant, index) => (
                <Button
                  key={index}
                  variant={selectedVariant === index ? 'default' : 'outline'}
                  onClick={() => handleSelectVariant(index)}
                >
                  Variant {variant.variant}
                  <span className="ml-2 text-xs">({variant.wordCount} words)</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Essay */}
      {generatedEssay && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Generated Essay</CardTitle>
                <CardDescription>
                  {wordCount} words {wordLimit && `/ ${wordLimit} word limit`}
                </CardDescription>
              </div>
              {wordLimit && wordCount > wordLimit && (
                <span className="text-red-600 text-sm font-semibold">Over limit!</span>
              )}
              {wordLimit && wordCount <= wordLimit && (
                <span className="text-green-600 text-sm font-semibold">Within limit ✓</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedEssay}
              onChange={(e) => setGeneratedEssay(e.target.value)}
              rows={20}
              className="font-serif text-base leading-relaxed"
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => navigator.clipboard.writeText(generatedEssay)}
                className="flex-1"
              >
                Copy to Clipboard
              </Button>
              <Button
                onClick={() => {
                  if (onEssayGenerated) {
                    onEssayGenerated(generatedEssay, wordCount);
                  }
                }}
                className="flex-1"
              >
                Save Essay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
