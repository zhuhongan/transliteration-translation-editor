# Transliteration & Translation Editor

A web-based tool for viewing, editing, and managing **transliteration and translation pairs**. 
Built with React and Vite.

While originally intended and developed for **Akkadian** transliterations, the application is completely **language-agnostic** and fully supports **UTF-8**, making it suitable for any language pairing.

## Features

- **Paired Editing**: View and edit transliteration and translation strings side-by-side in a table format.
- **Language Agnostic & UTF-8 Native**: Handles any language or special characters thanks to robust UTF-8 support. Originally built for Akkadian, but works with anything.
- **Advanced Text Manipulation**:
  - **Sentence Splitting**: Easily split a long sentence across multiple rows by pressing `Ctrl+Enter` while editing a cell.
  - **Row Merging**: Quickly merge the current row with the row below it by pressing `Ctrl+Shift+M`.
- **Responsive & Comfortable UI**: Optimized for desktop use. Text boxes and overall application width are carefully sized to provide a comfortable, readable user experience during long editing sessions.
- **Data Handling**: Seamlessly imports and exports data using standard CSV formats.

## Usage & Data Format

### Input Data
The application expects a CSV file named **`train.csv`** to be provided. 
- The data should contain at least an `id`, `transliteration`, and `translation` column.
- Text must be UTF-8 encoded.

### Editor Functions & Shortcuts

#### Splitting Sentences (`Ctrl + Enter`)
When you have a long sentence in a single cell that needs to be broken up:
1. Place your cursor in the text exactly where you want to split the sentence.
2. Press **`Ctrl + Enter`**.
3. The sentence will split at your cursor.
   - If the *next* row exists and its target cell is empty, the overflow text will smartly drop into that empty cell.
   - If the next row is occupied, an entirely **new row** is created below the current one to hold the overflow. The newly created row will automatically inherit the `id` of the original row it was split from.

#### Merging Rows (`Ctrl + Shift + M`)
When you want to recombine a row with the row immediately below it:
1. Ensure your focus/cursor is on the top row you wish to merge.
2. Press **`Ctrl + Shift + M`**.
3. Both the transliteration and translation texts from the current row and the next row will be concatenated together in the current row. 
4. The remaining bottom row is then deleted.

#### Auto-saving
The application tracks your editing progress and visually indicates which rows have been modified. Modifications are automatically saved as you work without requiring manual action.

## Development Setup

To run this project locally, you will need Node.js and npm installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd transliteration-translation-editor
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App Locally

To start the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Building for Production

To create an optimized production build:
```bash
npm run build
```
The resulting files will be placed in the `dist/` directory.

### Linting

To run the ESLint configuration:
```bash
npm run lint
```

## Technologies Used

- **React**: Frontend UI library
- **Vite**: Build tool and development server
- **PapaParse**: CSV parsing library

## License

This project is licensed under the [MIT License](LICENSE).
