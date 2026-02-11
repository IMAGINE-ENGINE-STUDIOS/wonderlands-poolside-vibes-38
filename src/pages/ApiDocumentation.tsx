import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Globe, Key, Server, BookOpen, Code, ArrowRight, Shield, Zap } from 'lucide-react';

const BASE_URL = 'https://bwngxlbnavnhbtahyzbf.supabase.co/functions/v1/public-api';

const copyToClipboard = async (text: string, setCopied: (id: string | null) => void, id: string) => {
  await navigator.clipboard.writeText(text);
  setCopied(id);
  setTimeout(() => setCopied(null), 2000);
};

const CodeBlock = ({ code, language = 'bash', id }: { code: string; language?: string; id: string }) => {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div className="relative group rounded-lg bg-gray-950 text-gray-100 text-sm font-mono overflow-x-auto">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-xs text-gray-500 uppercase">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={() => copyToClipboard(code, setCopied, id)}
        >
          {copied === id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto"><code>{code}</code></pre>
    </div>
  );
};

const endpoints = [
  {
    method: 'GET',
    path: '/products',
    description: 'List all products with pagination and filtering.',
    params: [
      { name: 'page', type: 'integer', default: '1', description: 'Page number' },
      { name: 'limit', type: 'integer', default: '20', description: 'Items per page (max 100)' },
      { name: 'category', type: 'string', default: '—', description: 'Filter by product category' },
      { name: 'search', type: 'string', default: '—', description: 'Search by product name' },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "category": "screens",
      "price": 2499.99,
      "description": "...",
      "image_url": "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/example.png",
      "sku": "WL-001",
      "brand": "Wonderlands",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 54
  }
}`,
    exampleCurl: `curl -X GET "${BASE_URL}/products?page=1&limit=10&category=screens" \\
  -H "Authorization: Bearer wl_your_api_key_here"`,
  },
  {
    method: 'GET',
    path: '/products/:id',
    description: 'Retrieve a single product by its UUID.',
    params: [
      { name: 'id', type: 'UUID', default: '—', description: 'The product UUID (path parameter)' },
    ],
    exampleResponse: `{
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "category": "screens",
    "price": 2499.99,
    "description": "...",
    "image_url": "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/example.png",
    "sku": "WL-001",
    "brand": "Wonderlands",
    "is_active": true
  }
}`,
    exampleCurl: `curl -X GET "${BASE_URL}/products/YOUR_PRODUCT_ID" \\
  -H "Authorization: Bearer wl_your_api_key_here"`,
  },
  {
    method: 'GET',
    path: '/pools',
    description: 'List all pool models with pagination and filtering.',
    params: [
      { name: 'page', type: 'integer', default: '1', description: 'Page number' },
      { name: 'limit', type: 'integer', default: '20', description: 'Items per page (max 100)' },
      { name: 'category', type: 'string', default: '—', description: 'Filter by pool category (e.g. fiberglass)' },
      { name: 'search', type: 'string', default: '—', description: 'Search by pool model name' },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "model": "Oasis 30",
      "category": "fiberglass",
      "price": 18500,
      "dimensions": "30x15x5",
      "features": ["LED lighting", "Built-in spa"],
      "image_url": "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/pool-example.png"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}`,
    exampleCurl: `curl -X GET "${BASE_URL}/pools?category=fiberglass&limit=5" \\
  -H "Authorization: Bearer wl_your_api_key_here"`,
  },
  {
    method: 'GET',
    path: '/pools/:id',
    description: 'Retrieve a single pool by its UUID.',
    params: [
      { name: 'id', type: 'UUID', default: '—', description: 'The pool UUID (path parameter)' },
    ],
    exampleResponse: `{
  "data": {
    "id": "uuid",
    "model": "Oasis 30",
    "category": "fiberglass",
    "price": 18500,
    "dimensions": "30x15x5",
    "features": ["LED lighting"],
    "image_url": "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/pool-example.png"
  }
}`,
    exampleCurl: `curl -X GET "${BASE_URL}/pools/YOUR_POOL_ID" \\
  -H "Authorization: Bearer wl_your_api_key_here"`,
  },
  {
    method: 'GET',
    path: '/pavers',
    description: 'List all paver products with pagination and filtering.',
    params: [
      { name: 'page', type: 'integer', default: '1', description: 'Page number' },
      { name: 'limit', type: 'integer', default: '20', description: 'Items per page (max 100)' },
      { name: 'category', type: 'string', default: '—', description: 'Filter by paver category' },
      { name: 'search', type: 'string', default: '—', description: 'Search by paver name' },
    ],
    exampleResponse: `{
  "data": [
    {
      "id": "uuid",
      "name": "Travertine Classic",
      "category": "natural_stone",
      "collection": "Premium",
      "base_price": 12.50,
      "image_url": "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/paver-example.png"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}`,
    exampleCurl: `curl -X GET "${BASE_URL}/pavers?limit=10" \\
  -H "Authorization: Bearer wl_your_api_key_here"`,
  },
  {
    method: 'GET',
    path: '/pavers/:id',
    description: 'Retrieve a single paver by its UUID.',
    params: [
      { name: 'id', type: 'UUID', default: '—', description: 'The paver UUID (path parameter)' },
    ],
    exampleResponse: `{
  "data": {
    "id": "uuid",
    "name": "Travertine Classic",
    "category": "natural_stone",
    "collection": "Premium",
    "base_price": 12.50,
    "image_url": "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/paver-example.png"
  }
}`,
    exampleCurl: `curl -X GET "${BASE_URL}/pavers/YOUR_PAVER_ID" \\
  -H "Authorization: Bearer wl_your_api_key_here"`,
  },
];

const ApiDocumentation = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Wonderlands API</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access our catalog of pools, products, and pavers programmatically. Read-only REST API with Bearer token authentication.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Badge variant="secondary" className="text-sm px-3 py-1"><Server className="h-3.5 w-3.5 mr-1" /> REST API</Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1"><Shield className="h-3.5 w-3.5 mr-1" /> Bearer Auth</Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1"><Zap className="h-3.5 w-3.5 mr-1" /> JSON Responses</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Quick Start */}
        <section id="quickstart">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" /> Quick Start</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  Get an API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Sign in to your Wonderlands account and generate an API key from the Admin Dashboard under API Management.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  Make a Request
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Include your API key in the <code className="bg-muted px-1 rounded">Authorization</code> header as a Bearer token with every request.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  Use the Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Parse the JSON response and integrate pools, products, and pavers data into your application.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Authentication */}
        <section id="authentication">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Key className="h-6 w-6 text-primary" /> Authentication</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-muted-foreground">All requests must include a valid API key in the <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Authorization</code> header.</p>
              <CodeBlock
                id="auth-header"
                language="http"
                code={`GET /products HTTP/1.1
Host: ${BASE_URL.replace('https://', '').split('/')[0]}
Authorization: Bearer wl_your_api_key_here`}
              />
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">⚠️ Keep your API key secret</p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">Never expose your API key in client-side code, public repositories, or browser requests. Always make API calls from your server.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Base URL */}
        <section id="base-url">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Server className="h-6 w-6 text-primary" /> Base URL</h2>
          <Card>
            <CardContent className="pt-6">
              <CodeBlock id="base-url" language="text" code={BASE_URL} />
            </CardContent>
          </Card>
        </section>

        {/* Endpoints */}
        <section id="endpoints">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Code className="h-6 w-6 text-primary" /> Endpoints</h2>
          <div className="space-y-8">
            {endpoints.map((ep, i) => (
              <Card key={i} id={`endpoint-${i}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs px-2.5 py-1">{ep.method}</Badge>
                    <code className="text-lg font-semibold">{ep.path}</code>
                  </div>
                  <CardDescription className="mt-2">{ep.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Parameters */}
                  {ep.params.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left px-4 py-2.5 font-medium">Name</th>
                              <th className="text-left px-4 py-2.5 font-medium">Type</th>
                              <th className="text-left px-4 py-2.5 font-medium">Default</th>
                              <th className="text-left px-4 py-2.5 font-medium">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ep.params.map((p, j) => (
                              <tr key={j} className="border-t">
                                <td className="px-4 py-2.5 font-mono text-xs">{p.name}</td>
                                <td className="px-4 py-2.5"><Badge variant="outline" className="text-xs">{p.type}</Badge></td>
                                <td className="px-4 py-2.5 text-muted-foreground">{p.default}</td>
                                <td className="px-4 py-2.5 text-muted-foreground">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <Tabs defaultValue="curl" className="w-full">
                    <TabsList>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                      <TabsTrigger value="response">Response</TabsTrigger>
                    </TabsList>
                    <TabsContent value="curl" className="mt-3">
                      <CodeBlock id={`curl-${i}`} language="bash" code={ep.exampleCurl} />
                    </TabsContent>
                    <TabsContent value="response" className="mt-3">
                      <CodeBlock id={`resp-${i}`} language="json" code={ep.exampleResponse} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Error Codes */}
        <section id="errors">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Shield className="h-6 w-6 text-primary" /> Error Codes</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium">Status</th>
                      <th className="text-left px-4 py-2.5 font-medium">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['200', 'OK — Request succeeded'],
                      ['400', 'Bad Request — Invalid parameters'],
                      ['401', 'Unauthorized — Missing or invalid API key'],
                      ['403', 'Forbidden — API key lacks required scope'],
                      ['404', 'Not Found — Resource does not exist'],
                      ['405', 'Method Not Allowed — Only GET is supported'],
                      ['429', 'Rate Limited — Too many requests'],
                      ['500', 'Server Error — Something went wrong on our end'],
                    ].map(([code, desc], i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2.5">
                          <Badge variant={code.startsWith('2') ? 'default' : code.startsWith('4') ? 'secondary' : 'destructive'} className="font-mono">{code}</Badge>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Rate Limits */}
        <section id="rate-limits">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Zap className="h-6 w-6 text-primary" /> Rate Limits & Best Practices</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" /> Cache responses on your end to reduce unnecessary requests.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" /> Use pagination (<code className="bg-muted px-1 rounded text-sm">page</code> & <code className="bg-muted px-1 rounded text-sm">limit</code>) to fetch data in manageable chunks.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" /> Use <code className="bg-muted px-1 rounded text-sm">category</code> and <code className="bg-muted px-1 rounded text-sm">search</code> filters to reduce payload size.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" /> Store your API key securely in environment variables — never hardcode it.</li>
                <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" /> The maximum page size is <strong>100 items</strong>. Requesting more will be capped.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Wonderlands API Documentation — © {new Date().getFullYear()} Wonderlands World</p>
      </footer>
    </div>
  );
};

export default ApiDocumentation;
