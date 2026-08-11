# Citations Badge Application

This application is a Rails API backend and a static frontend widget for the HelixLab P·1000 product page.

## Requirements

- Ruby 3.2.2
- Rails 7.2
- SQLite3

## Setup

From the `citation_manager` directory:

```powershell
bundle install
bundle exec rails db:create db:migrate db:seed
bundle exec rails server
```

The Rails API will run at `http://localhost:3000`.

## Frontend

Open `public/helix_lab_instruments__p_1000.html` in a browser.
The widget will fetch citations from the Rails API at `http://localhost:3000/api/citations`.

## Backend behavior

- `GET /api/citations` returns all citations ordered by `date` descending by default.
- `GET /api/citations?order=asc` returns citations ordered by date ascending.
- Invalid `order` values fall back to the default descending sort.
- `GET /api/citations/:id` returns a single citation record.
- CORS is enabled for `localhost:3000`, `127.0.0.1:3000`, and `localhost:8000`.
- Query parameter validation is implemented on the server, making it easy to extend with additional filter options later.

## Widget behavior

- The widget mounts at `<div id="citations-badge"></div>` in `public/helix_lab_instruments__p_1000.html`.
- It shows a total citation count and one card per citation.
- Each card includes the article title, journal, date, truncated author list, and the highlighted excerpt.
- `<t>` and `<c>` tokens are parsed into safe DOM elements using a small parser.
- Each card has a `Show more / Show less` toggle for short/long excerpts.
- The widget supports `Newest First / Oldest First` sorting via `?order=asc` to the API.

## Test

Run the system parser test with:

```powershell
bundle exec rails test test/system/citation_parser_test.rb
```
