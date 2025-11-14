# Document Network Analysis System

A document analysis and relationship extraction system that uses Claude AI agents to analyze documents and extract structured information including summaries, metadata, and RDF triples for relationship graph building.

## Features

- **Automated Document Analysis**: Uses Claude Haiku agents to analyze documents in parallel (10 at a time)
- **Structured Extraction**: Extracts summaries, categories, tags, and date ranges
- **RDF Triple Extraction**: Builds relationship graphs with temporal and location data (actor → action → target @ location)
- **Unknown Person Handling**: Uses placeholders ("unknown person A", "redacted individual B") to distinguish different unknown entities within documents
- **SQLite Storage**: Persistent storage with efficient indexing for querying
- **Cost Tracking**: Tracks token usage and costs for each analysis
- **Parallel Processing**: Processes 10 documents concurrently for 60%+ cost reduction through better caching

## Setup

```bash
npm install
```

## Usage

### Analyze Documents

Analyze documents from a directory (defaults to 10 documents):

```bash
npm run analyze
```

Analyze specific number of documents:

```bash
npm run analyze -- data/001 50  # Analyze 50 documents
```

Custom database path:

```bash
npm run analyze -- data/001 50 custom.db
```

### Query Database

View summary statistics and relationships:

```bash
npm run query
```

Use custom database:

```bash
npm run query -- custom.db
```

### Direct SQL Queries

```bash
sqlite3 document_analysis.db
```

Example queries:

```sql
-- View all documents
SELECT doc_id, category, one_sentence_summary FROM documents;

-- Find all relationships involving a specific person
SELECT timestamp, actor, action, target
FROM rdf_triples
WHERE actor LIKE '%Epstein%' OR target LIKE '%Epstein%'
ORDER BY timestamp;

-- Get all documents by category
SELECT category, COUNT(*) as count
FROM documents
GROUP BY category
ORDER BY count DESC;

-- View content tags across all documents
SELECT doc_id, content_tags
FROM documents;

-- Find documents within a date range
SELECT doc_id, date_range_earliest, date_range_latest, one_sentence_summary
FROM documents
WHERE date_range_earliest >= '2005-01-01'
  AND date_range_latest <= '2010-12-31';

-- Network analysis: Most connected actors
SELECT actor, COUNT(*) as connection_count
FROM rdf_triples
GROUP BY actor
ORDER BY connection_count DESC
LIMIT 20;
```

## Database Schema

### `documents` table
- `doc_id`: Unique document identifier
- `file_path`: Original file path
- `one_sentence_summary`: Brief summary with main actors
- `paragraph_summary`: Detailed summary (3-5 sentences)
- `date_range_earliest/latest`: Visible date ranges in document
- `category`: Document type (court_filing, email, letter, etc.)
- `content_tags`: JSON array of topic tags
- `analysis_timestamp`: When analysis was performed
- `input_tokens`, `output_tokens`, `cache_read_tokens`: Token usage
- `cost_usd`: Cost of analysis

### `rdf_triples` table
- `doc_id`: Reference to source document
- `timestamp`: When the relationship occurred (if available)
- `actor`: Person/entity name performing the action (clean name only, no location)
- `action`: The action verb (e.g., "met with", "sent email to")
- `target`: Person/entity name receiving the action (clean name only, no location)
- `location`: Physical location where the action occurred (optional)
- `sequence_order`: Order within the document

## Analysis Output

Each document analysis produces:

1. **One-sentence summary**: Including main actors and topic
2. **Paragraph summary**: Detailed explanation with context
3. **Date ranges**: Earliest and latest dates mentioned
4. **Category**: Document classification
5. **Content tags**: Topic tags for filtering and search
6. **RDF triples**: Relationship graph edges with temporal data

## Example Output

```json
{
  "doc_id": "HOUSE_OVERSIGHT_010477",
  "one_sentence_summary": "A photographic document from House Oversight examining Jeffrey Epstein's life, properties, and associations with prominent figures.",
  "paragraph_summary": "This House Oversight document is a pictorial compilation documenting Jeffrey Epstein's biography, criminal activities, and high-profile associations...",
  "date_range_earliest": "1969",
  "date_range_latest": "2016-01",
  "category": "mixed_document",
  "content_tags": [
    "criminal_investigation",
    "high_profile_connections",
    "real_estate"
  ],
  "rdf_triples": [
    {
      "timestamp": "1997-04-08",
      "actor": "Jeffrey Epstein",
      "action": "attended party with",
      "target": "Donald Trump",
      "location": "Laura Belle club, New York City"
    },
    {
      "timestamp": "2002-01-01",
      "actor": "Jeffrey Epstein",
      "action": "began systematic sexual abuse of",
      "target": "unknown person A",
      "location": "West Palm Beach, Florida"
    }
  ]
}
```

## Cost Efficiency

- Uses **Claude Haiku 4.5** for fast, cost-effective analysis
- **Parallel processing** (10 documents at a time) with prompt caching dramatically reduces costs
- Typical cost with parallel processing: ~$0.014 per document
- 10 documents analyzed in parallel: **~$0.14** (vs $0.36 sequential = 61% savings!)
- Cache hit rate: >95% on subsequent document batches

## Files

- `analyze_documents.ts`: Main analysis script
- `query_db.ts`: Database query and statistics tool
- `document_analysis.db`: SQLite database (created on first run)
- `document_analysis_results.json`: JSON export of all analyses
- `extract_data.py`: Python script for extracting metadata from .dat/.opt files

## Next Steps

- Implement synthesis step to aggregate patterns across documents
- Build graph visualization of relationships
- Add full-text search capabilities
- Implement entity resolution and normalization
- Add timeline visualization of events
