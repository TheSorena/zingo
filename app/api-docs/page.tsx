'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Copy, CheckCircle, ChevronDown, ChevronRight, Search, Film, Play, Calendar, Code, Globe, Zap } from 'lucide-react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
  example: string;
}

interface ApiSection {
  title: string;
  icon: React.ReactNode;
  endpoints: ApiEndpoint[];
}

const ApiDocumentationPage = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    search: true,
    movies: true,
    series: true,
    seasons: true,
  });
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Set the base URL after client-side hydration to avoid hydration errors
    setBaseUrl(window.location.origin);
  }, []);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const apiSections: ApiSection[] = [
    {
      title: 'Search',
      icon: <Search className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/search',
          description: 'Search for movies and series by query parameter',
          parameters: [
            { name: 'q', type: 'string', required: true, description: 'Search query string' }
          ],
          response: 'Returns search results matching the query',
          example: `${baseUrl}/api/search?q=avatar`
        },
        {
          method: 'GET',
          path: '/api/search/[query]',
          description: 'Search for movies and series by URL parameter',
          parameters: [
            { name: 'query', type: 'string', required: true, description: 'Search query as URL parameter' }
          ],
          response: 'Returns search results matching the query',
          example: `${baseUrl}/api/search/avatar`
        }
      ]
    },
    {
      title: 'Movies',
      icon: <Film className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/movies/new',
          description: 'Get new movies with pagination support',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number (default: 0)' },
          ],
          response: 'Returns an array of new movies',
          example: `${baseUrl}/api/movies/new?page=1`
        },
        {
          method: 'GET',
          path: '/api/movies/top-rated',
          description: 'Get top-rated movies with pagination support',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number (default: 0)' },
          ],
          response: 'Returns an array of top-rated movies',
          example: `${baseUrl}/api/movies/top-rated?page=1`
        }
      ]
    },
    {
      title: 'Series',
      icon: <Play className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/series/new',
          description: 'Get new TV series with pagination support',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number (default: 0)' },
          ],
          response: 'Returns an array of new series',
          example: `${baseUrl}/api/series/new?page=1`
        },
        {
          method: 'GET',
          path: '/api/series/top-rated',
          description: 'Get top-rated TV series with pagination support',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number (default: 0)' },
          ],
          response: 'Returns an array of top-rated series',
          example: `${baseUrl}/api/series/top-rated?page=1`
        },
        {
          method: 'GET',
          path: '/api/series/updated',
          description: 'Get recently updated TV series with pagination support',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number (default: 0)' },
          ],
          response: 'Returns an array of recently updated series',
          example: `${baseUrl}/api/series/updated?page=1`
        },
        {
          method: 'GET',
          path: '/api/series/best',
          description: 'Get best TV series with pagination support',
          parameters: [
            { name: 'page', type: 'number', required: false, description: 'Page number (default: 0)' },
          ],
          response: 'Returns an array of best series',
          example: `${baseUrl}/api/series/best?page=1`
        }
      ]
    },
    {
      title: 'Seasons',
      icon: <Calendar className="w-5 h-5" />,
      endpoints: [
        {
          method: 'GET',
          path: '/api/seasons/[id]',
          description: 'Get seasons for a specific series by ID',
          parameters: [
            { name: 'id', type: 'string', required: true, description: 'Series ID' }
          ],
          response: 'Returns an array of seasons for the specified series',
          example: `${baseUrl}/api/seasons/123456`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900" dir="ltr">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
            Cinema Plus API
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Comprehensive REST API documentation for accessing movies, TV series, seasons, and powerful search functionality. 
            Built with modern standards and optimized for performance.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Globe className="w-5 h-5" />
              <span className="text-sm">RESTful API</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Zap className="w-5 h-5" />
              <span className="text-sm">High Performance</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">JSON Response</span>
            </div>
          </div>
        </div>

        {/* API Overview */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">API Overview</h2>
              <p className="text-gray-600 dark:text-gray-300">Explore our comprehensive API endpoints</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Search</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">2 endpoints</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Query movies and series</p>
            </div>
            
            <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Film className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Movies</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">2 endpoints</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Latest and top-rated</p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">TV Series</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">4 endpoints</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete series catalog</p>
            </div>
            
            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Seasons</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">1 endpoint</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Series season data</p>
            </div>
          </div>
        </div>

        {/* API Sections */}
        {apiSections.map((section) => (
          <div key={section.title} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-8 overflow-hidden">
            <div 
              className="flex items-center justify-between p-8 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => toggleSection(section.title.toLowerCase())}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full font-medium">
                      {section.endpoints.length} endpoint{section.endpoints.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedSections[section.title.toLowerCase()] ? (
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-gray-500" />
                )}
              </div>
            </div>

            {expandedSections[section.title.toLowerCase()] && (
              <div className="px-8 pb-8">
                {section.endpoints.map((endpoint, index) => (
                  <div key={index} className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8 first:border-t-0 first:mt-0 first:pt-0">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-mono text-sm font-semibold shadow-lg">
                        {endpoint.method}
                      </span>
                      <code className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-mono text-sm border border-gray-200 dark:border-gray-600">
                        {endpoint.path}
                      </code>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                      {endpoint.description}
                    </p>

                    {endpoint.parameters && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Parameters</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">Name</th>
                                <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">Type</th>
                                <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">Required</th>
                                <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param, paramIndex) => (
                                <tr key={paramIndex} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <td className="py-4 px-6 font-mono text-gray-800 dark:text-gray-200 font-medium">{param.name}</td>
                                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{param.type}</td>
                                  <td className="py-4 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      param.required 
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    }`}>
                                      {param.required ? 'Required' : 'Optional'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Response</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-300">{endpoint.response}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">Example Request</h4>
                      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-6 relative border border-gray-700">
                        <code dir='ltr' className="text-green-400 font-mono text-sm break-all block leading-relaxed">
                          {endpoint.example || 'Loading...'}
                        </code>
                        <button
                          onClick={() => copyToClipboard(endpoint.example, `${section.title}-${index}`)}
                          className="absolute top-3 right-3 p-2 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                          title="Copy to clipboard"
                        >
                          {copiedEndpoint === `${section.title}-${index}` ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-400 group-hover:text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-4">
            <Code className="w-5 h-5" />
            <span className="text-lg font-semibold">Cinema Plus API</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Built with ❤️ for developers. All endpoints return JSON responses with proper HTTP status codes.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <span>REST API</span>
            <span>•</span>
            <span>JSON Response</span>
            <span>•</span>
            <span>HTTP Status Codes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentationPage; 