#!/usr/bin/env node
// Валидация YAML фронтматтера в агентах и скиллах

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

function validateYamlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Проверяем наличие frontmatter
  if (!content.startsWith('---')) {
    return { valid: false, error: 'Нет frontmatter (---)' };
  }
  
  // Находим конец frontmatter
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return { valid: false, error: 'Нет закрывающего ---' };
  }
  
  const frontmatter = content.slice(3, endIndex).trim();
  
  try {
    const parsed = yaml.parse(frontmatter);
    
    // Проверяем обязательные поля для агентов
    if (filePath.includes('/agents/')) {
      if (!parsed.description) return { valid: false, error: 'Нет поля description' };
      if (!parsed.mode) return { valid: false, error: 'Нет поля mode' };
      if (!parsed.tools) return { valid: false, error: 'Нет поля tools' };
    }
    
    // Проверяем обязательные поля для скиллов
    if (filePath.includes('/skills/')) {
      if (!parsed.name) return { valid: false, error: 'Нет поля name' };
      if (!parsed.description) return { valid: false, error: 'Нет поля description' };
    }
    
    return { valid: true, parsed };
  } catch (e) {
    return { valid: false, error: `YAML error: ${e.message}` };
  }
}

function scanDirectory(dir, pattern) {
  const results = [];
  
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      results.push(...scanDirectory(fullPath, pattern));
    } else if (file.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

console.log('=== Валидация YAML файлов ===\n');

// Проверяем агентов
console.log('Агенты:');
const agentFiles = scanDirectory('./agents', '*.md');
let agentErrors = 0;

for (const file of agentFiles) {
  const result = validateYamlFile(file);
  const relativePath = path.relative('.', file);
  
  if (result.valid) {
    console.log(`  ✅ ${relativePath}`);
  } else {
    console.log(`  ❌ ${relativePath}: ${result.error}`);
    agentErrors++;
  }
}

console.log(`\nАгенты: ${agentFiles.length - agentErrors}/${agentFiles.length} ✅`);

// Проверяем скиллы
console.log('\nСкиллы:');
const skillFiles = scanDirectory('./skills', 'SKILL.md');
let skillErrors = 0;

for (const file of skillFiles) {
  const result = validateYamlFile(file);
  const relativePath = path.relative('.', file);
  
  if (result.valid) {
    console.log(`  ✅ ${relativePath}`);
  } else {
    console.log(`  ❌ ${relativePath}: ${result.error}`);
    skillErrors++;
  }
}

console.log(`\nСкиллы: ${skillFiles.length - skillErrors}/${skillFiles.length} ✅`);

// Итог
console.log('\n=== Результат ===');
const totalErrors = agentErrors + skillErrors;
if (totalErrors === 0) {
  console.log('✅ Все YAML файлы валидны!');
} else {
  console.log(`❌ Найдено ошибок: ${totalErrors}`);
  process.exit(1);
}