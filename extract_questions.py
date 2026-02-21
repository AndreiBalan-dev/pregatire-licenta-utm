#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Extract questions from Grile Licenta 2026.pdf and generate TypeScript files."""

import fitz
import re
import os
import random

doc = fitz.open("Grile Licenta 2026.pdf")

# First, dump all text organized by page to understand structure
pages_text = []
for i in range(len(doc)):
    pages_text.append(doc[i].get_text())

# Detect which subject each page belongs to by looking at page headers
subject_map = {
    "FUNDAMENTELE PROGRAMĂRII": ("fundamentele-programarii", "programming", "fundamenteleProgramarii"),
    "FUNDAMENTELE PROGRAMARII": ("fundamentele-programarii", "programming", "fundamenteleProgramarii"),
    "PROGRAMARE ÎN PYTHON": ("programare-python", "programming", "programarePython"),
    "PROGRAMARE IN PYTHON": ("programare-python", "programming", "programarePython"),
    "PROGRAMARE ORIENTATĂ PE OBIECTE": ("poo-cpp", "programming", "pooCpp"),
    "PROGRAMARE ORIENTATA PE OBIECTE": ("poo-cpp", "programming", "pooCpp"),
    "METODE AVANSATE DE PROGRAMARE": ("metode-avansate-java", "programming", "metodeAvansateJava"),
    "TEHNICI AVANSATE DE PROGRAMARE": ("tehnici-avansate", "programming", "tehniciAvansate"),
    "ALGORITMI ȘI STRUCTURI DE DATE": ("algoritmi-structuri-date", "programming", "algoritmiStructuriDate"),
    "ALGORITMI SI STRUCTURI DE DATE": ("algoritmi-structuri-date", "programming", "algoritmiStructuriDate"),
    "BAZE DE DATE": ("baze-de-date", "databases", "bazeDeDate"),
    "SISTEME DE GESTIUNE A BAZELOR DE DATE": ("sgbd", "databases", "sgbd"),
    "SISTEME DE OPERARE": ("sgbd", "databases", "sgbd"),  # Map to sgbd as it appears in module 2
    "REȚELE DE CALCULATOARE": ("retele-calculatoare", "networks", "reteleCalculatoare"),
    "RETELE DE CALCULATOARE": ("retele-calculatoare", "networks", "reteleCalculatoare"),
    "ADMINISTRAREA REȚELELOR": ("administrarea-retelelor", "networks", "administrareaRetelelor"),
    "ADMINISTRAREA RETELELOR": ("administrarea-retelelor", "networks", "administrareaRetelelor"),
    "CRIPTOGRAFIE": ("criptografie", "networks", "criptografie"),
    "TEHNOLOGII WEB": ("tehnologii-web", "web", "tehnologiiWeb"),
    "COMERT ELECTRONIC": ("comert-electronic", "web", "comertElectronic"),
    "COMERȚ ELECTRONIC": ("comert-electronic", "web", "comertElectronic"),
    "CLOUD COMPUTING": ("cloud-computing", "web", "cloudComputing"),
    "INOVARE ȘI TRANSFORMARE DIGITALĂ": ("inovare-transformare-digitala", "web", "inovareTransformareDigitala"),
    "INOVARE SI TRANSFORMARE DIGITALA": ("inovare-transformare-digitala", "web", "inovareTransformareDigitala"),
}

def detect_subject(page_text):
    """Detect which subject a page belongs to from its header."""
    first_lines = page_text[:300].upper()
    for header, info in subject_map.items():
        if header.upper() in first_lines:
            return info
    return None

# Concatenate text by subject
subject_texts = {}
for i, text in enumerate(pages_text):
    subject_info = detect_subject(text)
    if subject_info:
        sid, mid, vname = subject_info
        if sid not in subject_texts:
            subject_texts[sid] = {"text": "", "moduleId": mid, "varName": vname}
        subject_texts[sid]["text"] += text + "\n"

print("Detected subjects and page counts:")
for sid, data in subject_texts.items():
    approx_pages = data["text"].count("\n\n") // 2
    print(f"  {sid}: ~{len(data['text'])} chars")

# Parse questions from concatenated text
def parse_questions(text, subject_id, module_id):
    """Parse questions from text using a robust line-by-line approach."""
    questions = []

    # Remove page headers and numbers
    for header in subject_map:
        text = text.replace(header, "")
        text = text.replace(header.lower(), "")

    # Split into potential questions using numbered pattern
    # Match: number followed by period at start of line or after whitespace
    parts = re.split(r'\n\s*(\d+)\.\s+', text)

    # parts[0] is text before first question
    # Then alternating: question_number, question_body
    i = 1
    while i < len(parts) - 1:
        q_num_str = parts[i]
        q_body = parts[i + 1]
        i += 2

        try:
            q_num = int(q_num_str)
        except ValueError:
            continue

        if q_num < 1 or q_num > 100:
            continue

        # Try to extract options - handle both a) and a. formats
        opt_match = None
        opt_start_pos = -1

        # Try patterns in order of specificity
        patterns = [
            # a) b) c) d) with terminator
            (r'\n\s*a\)\s*(.*?)\n\s*b\)\s*(.*?)\n\s*c\)\s*(.*?)\n\s*d\)\s*(.*?)(?:\n\s*(?:Răspuns|$|\d+\.))', r'\na\)'),
            # a) b) c) d) relaxed
            (r'\n?\s*a\)\s*(.*?)\s*\n\s*b\)\s*(.*?)\s*\n\s*c\)\s*(.*?)\s*\n\s*d\)\s*(.*?)$', r'a\)'),
            # a. b. c. d. format (used in Algoritmi, Criptografie, etc.)
            (r'\n\s*a\.\s*(.*?)\n\s*b\.\s*(.*?)\n\s*c\.\s*(.*?)\n\s*d\.\s*(.*?)(?:\n\s*(?:Răspuns|$|\d+\.))', r'\na\.'),
            # a. b. c. d. relaxed
            (r'\n?\s*a\.\s*(.*?)\s*\n\s*b\.\s*(.*?)\s*\n\s*c\.\s*(.*?)\s*\n\s*d\.\s*(.*?)$', r'a\.'),
        ]

        for pattern, start_pattern in patterns:
            opt_match = re.search(pattern, q_body, re.DOTALL)
            if opt_match:
                m = re.search(r'\n\s*' + start_pattern, q_body)
                if m:
                    opt_start_pos = m.start()
                else:
                    m2 = re.search(start_pattern, q_body)
                    if m2:
                        opt_start_pos = m2.start()
                break

        if not opt_match or opt_start_pos == -1:
            continue

        question_text = q_body[:opt_start_pos].strip()
        opt_a = opt_match.group(1).strip()
        opt_b = opt_match.group(2).strip()
        opt_c = opt_match.group(3).strip()
        opt_d = opt_match.group(4).strip()

        # Clean multi-line options to single line (unless code)
        def clean_option(o):
            # Remove trailing noise
            o = re.sub(r'\n\s*\d{1,2}\s*$', '', o)
            o = re.sub(r'\n\s*Răspuns.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\n\s*Explicație.*$', '', o, flags=re.DOTALL)
            # Remove page numbers embedded in code (standalone 1-2 digit numbers on their own line)
            o = re.sub(r'\n\s*(\d{1,2})\s*\n', '\n', o)
            # Remove inline page numbers that appear between code statements
            # Pattern: "statement; <page_num> next_statement" -> "statement; next_statement"
            o = re.sub(r'([;{})\]]) \d{1,2} ([a-zA-Z{(])', r'\1 \2', o)
            # Also catch "return s; 11 }" -> "return s; }"
            o = re.sub(r';\s+\d{1,2}\s+}', '; }', o)
            # Remove page header fragments (e.g., "/ DE CALCULATOARE", "/ PROGRAMĂRII")
            o = re.sub(r'\s*/\s*DE CALCULATOARE', '', o, flags=re.IGNORECASE)
            o = re.sub(r'\s*/\s*PROGRAMĂRII', '', o, flags=re.IGNORECASE)
            o = re.sub(r'\s*/\s*PROGRAMARII', '', o, flags=re.IGNORECASE)
            for header in subject_map:
                o = o.replace(header, '')
                o = o.replace(header.upper(), '')
            # Remove question text that leaked into option (look for "Ce valori", "Indicați", "În care")
            o = re.sub(r'\s*Ce valori.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*Indicați ce se va.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*În care dintre.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*Ce operaţii.*$', '', o, flags=re.DOTALL)
            o = re.sub(r'\s*Ce operații.*$', '', o, flags=re.DOTALL)
            # Remove stray question markers that leaked (e.g., "a) 124 4" -> "124 4")
            o = re.sub(r'^[a-d]\)\s+', '', o)
            # If short, join lines
            if len(o) < 200:
                o = ' '.join(o.split())
            return o.strip()

        opt_a = clean_option(opt_a)
        opt_b = clean_option(opt_b)
        opt_c = clean_option(opt_c)
        opt_d = clean_option(opt_d)

        if not question_text or not opt_a or not opt_b:
            continue

        # Try to find correct answer
        correct = "a"  # default
        answer_match = re.search(r'Răspuns\s*(?:corect)?[:\s]*([a-d])\)', q_body, re.IGNORECASE)
        if answer_match:
            correct = answer_match.group(1).lower()

        # Detect code in question
        code = None
        code_language = None
        code_indicators = {
            'c': [r'#include', r'printf\(', r'scanf\(', r'int main\b', r'void \w+\('],
            'cpp': [r'cout\s*<<', r'cin\s*>>', r'class\s+\w+\s*[:{]', r'endl'],
            'python': [r'def\s+\w+\(', r'print\(', r'range\(', r'lambda\s', r'import\s'],
            'java': [r'System\.out', r'public\s+class', r'public\s+static\s+void'],
            'sql': [r'SELECT\s+', r'CREATE\s+TABLE', r'INSERT\s+INTO', r'FROM\s+\w+', r'WHERE\s+'],
            'js': [r'document\.', r'function\s+\w+\(', r'var\s+\w+\s*=', r'alert\(', r'console\.'],
            'php': [r'\$\w+\s*=', r'echo\s+', r'<\?php'],
        }

        for lang, patterns in code_indicators.items():
            for pat in patterns:
                if re.search(pat, question_text):
                    code_language = lang
                    break
            if code_language:
                break

        # Extract code block from question text
        if code_language:
            # Try to separate prose from code
            lines = question_text.split('\n')
            prose_lines = []
            code_lines = []
            in_code = False

            for line in lines:
                stripped = line.strip()
                # Heuristic: lines that look like code
                is_code_line = False
                if any(re.search(p, stripped) for lang_pats in code_indicators.values() for p in lang_pats):
                    is_code_line = True
                elif in_code and stripped and (
                    stripped.startswith('{') or stripped.startswith('}') or
                    stripped.startswith('//') or stripped.startswith('/*') or
                    re.match(r'^[\w\s\*\+\-\=\;\,\.\(\)\[\]\{\}\<\>\&\|\!\%\/\#]+$', stripped) and
                    not stripped.endswith('?') and not stripped.endswith(':') and
                    len(stripped) < 80
                ):
                    is_code_line = True
                elif in_code and not stripped:
                    is_code_line = True  # blank line in code block

                if is_code_line and (in_code or any(re.search(p, stripped) for lang_pats in code_indicators.values() for p in lang_pats)):
                    in_code = True
                    code_lines.append(line)
                else:
                    if in_code and not stripped:
                        code_lines.append(line)
                    else:
                        in_code = False
                        prose_lines.append(line)

            if code_lines:
                code = '\n'.join(code_lines).strip()
                question_text = '\n'.join(prose_lines).strip()

        # Clean question text
        question_text = re.sub(r'\n{3,}', '\n\n', question_text).strip()
        # Remove stray page numbers from question text
        question_text = re.sub(r'^\d{1,2}\s*\n', '', question_text)
        # Remove page numbers embedded in the middle of question text
        question_text = re.sub(r'\n\s*\d{1,2}\s*\n', '\n', question_text)
        # Remove inline page numbers in code within question text
        question_text = re.sub(r'([;{})\]]) \d{1,2} ([a-zA-Z{(])', r'\1 \2', question_text)
        question_text = re.sub(r';\s+\d{1,2}\s+}', '; }', question_text)
        # Remove page header fragments
        question_text = re.sub(r'\s*/\s*DE CALCULATOARE', '', question_text, flags=re.IGNORECASE)
        for header in subject_map:
            question_text = question_text.replace(header, '')
            question_text = question_text.replace(header.upper(), '')

        # Shuffle options so correct answer isn't always 'a'
        # Use deterministic seed based on subject+question number for reproducibility
        option_items = [('a', opt_a), ('b', opt_b), ('c', opt_c), ('d', opt_d)]
        rng = random.Random(f"{subject_id}-{q_num}")
        rng.shuffle(option_items)

        # Map old letter -> new letter
        new_letters = ['a', 'b', 'c', 'd']
        old_to_new = {}
        new_options = {}
        for idx, (old_letter, text) in enumerate(option_items):
            new_letter = new_letters[idx]
            old_to_new[old_letter] = new_letter
            new_options[new_letter] = text

        new_correct = old_to_new[correct]

        questions.append({
            'num': q_num,
            'text': question_text,
            'code': code if code and len(code) > 5 else None,
            'codeLanguage': code_language if code and len(code) > 5 else None,
            'options': new_options,
            'correctAnswer': new_correct,
            'subjectId': subject_id,
            'moduleId': module_id,
        })

    return questions

# Extract all questions
all_questions = []
global_id = 1

for subject_id, data in subject_texts.items():
    questions = parse_questions(data["text"], subject_id, data["moduleId"])

    # Remove duplicates (same q_num in same subject)
    seen_nums = set()
    unique_questions = []
    for q in questions:
        if q['num'] not in seen_nums:
            seen_nums.add(q['num'])
            unique_questions.append(q)

    # Assign global IDs
    for q in unique_questions:
        q['id'] = global_id
        global_id += 1

    all_questions.extend(unique_questions)
    print(f"  {subject_id}: {len(unique_questions)} questions")

print(f"\nTotal: {len(all_questions)} questions")

# Generate TypeScript files
def escape_ts(s):
    if s is None:
        return 'undefined'
    s = s.replace('\\', '\\\\')
    s = s.replace('`', '\\`')
    s = s.replace('${', '\\${')
    return s

subject_to_path = {
    'fundamentele-programarii': ('programming', 'fundamenteleProgramarii'),
    'programare-python': ('programming', 'programarePython'),
    'poo-cpp': ('programming', 'pooCpp'),
    'metode-avansate-java': ('programming', 'metodeAvansateJava'),
    'tehnici-avansate': ('programming', 'tehniciAvansate'),
    'algoritmi-structuri-date': ('programming', 'algoritmiStructuriDate'),
    'baze-de-date': ('databases', 'bazeDeDate'),
    'sgbd': ('databases', 'sgbd'),
    'retele-calculatoare': ('networks', 'reteleCalculatoare'),
    'criptografie': ('networks', 'criptografie'),
    'tehnologii-web': ('web', 'tehnologiiWeb'),
    'comert-electronic': ('web', 'comertElectronic'),
    'cloud-computing': ('web', 'cloudComputing'),
    'inovare-transformare-digitala': ('web', 'inovareTransformareDigitala'),
}

# Group questions by subject
by_subject = {}
for q in all_questions:
    sid = q['subjectId']
    if sid not in by_subject:
        by_subject[sid] = []
    by_subject[sid].append(q)

base_dir = 'src/data/questions'

for subject_id, (module_folder, var_name) in subject_to_path.items():
    dir_path = os.path.join(base_dir, module_folder)
    os.makedirs(dir_path, exist_ok=True)

    questions = by_subject.get(subject_id, [])

    lines = []
    lines.append('import type { Question } from "@/data/types";\n')
    lines.append(f'export const {var_name}: Question[] = [')

    for q in questions:
        code_str = f'`{escape_ts(q["code"])}`' if q['code'] else 'undefined'
        code_lang = f'"{q["codeLanguage"]}"' if q['codeLanguage'] else 'undefined'

        lines.append('  {')
        lines.append(f'    id: {q["id"]},')
        lines.append(f'    moduleId: "{q["moduleId"]}",')
        lines.append(f'    subjectId: "{q["subjectId"]}",')
        lines.append(f'    text: `{escape_ts(q["text"])}`,')
        lines.append(f'    code: {code_str},')
        lines.append(f'    codeLanguage: {code_lang},')
        lines.append(f'    options: {{')
        lines.append(f'      a: `{escape_ts(q["options"]["a"])}`,')
        lines.append(f'      b: `{escape_ts(q["options"]["b"])}`,')
        lines.append(f'      c: `{escape_ts(q["options"]["c"])}`,')
        lines.append(f'      d: `{escape_ts(q["options"]["d"])}`,')
        lines.append(f'    }},')
        lines.append(f'    correctAnswer: "{q["correctAnswer"]}",')
        lines.append('  },')

    lines.append('];\n')

    file_path = os.path.join(dir_path, f'{subject_id}.ts')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"  Generated {file_path}: {len(questions)} questions")

print("\nDone!")
