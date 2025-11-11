#!/bin/bash

echo "🔍 Checking React Compiler transformation..."
echo ""

# Clean and build
echo "📦 Building project..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Skipping dist check."
  echo ""
  echo "💡 Let's check the source files instead..."
  echo ""
fi

# Check dist for useMemoCache
echo "🔎 Searching for useMemoCache in dist..."
if [ -d "dist" ]; then
  found=$(grep -r "useMemoCache" dist/ 2>/dev/null | wc -l | tr -d ' ')
  if [ "$found" -gt 0 ]; then
    echo "✅ Found useMemoCache $found times"
    echo ""
    echo "Sample occurrences:"
    grep -r "useMemoCache" dist/ 2>/dev/null | head -5
  else
    echo "❌ No useMemoCache found"
    echo "   → React Compiler may not be transforming the code"
  fi
else
  echo "⚠️  dist folder not found"
fi

echo ""
echo "=" | head -c 60
echo ""

# Check specific files
echo "📄 Checking specific hooks..."
echo ""

files=(
  "src/hooks/useIncompatibleMovieList.ts"
  "src/pages/CustomHookPage.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "File: $file"
    echo "-" | head -c 50
    
    # Check for "use no memo"
    if grep -q "use no memo" "$file" 2>/dev/null; then
      echo "  🚫 Has 'use no memo' directive"
    fi
    
    # Check for eslint-disable
    if grep -q "eslint-disable.*react-hooks" "$file" 2>/dev/null; then
      echo "  ⚠️  Has eslint-disable react-hooks comment"
      grep -n "eslint-disable.*react-hooks" "$file" 2>/dev/null | head -3
    fi
    
    # Check for useVirtualizer
    if grep -q "useVirtualizer" "$file" 2>/dev/null; then
      echo "  ✅ Uses useVirtualizer"
    fi
    
    echo ""
  fi
done

echo ""
echo "💡 To see real-time React Compiler logs:"
echo "   1. npm run dev"
echo "   2. Open browser to http://localhost:5173"
echo "   3. Navigate to /custom-hook page"
echo "   4. Check terminal for [React Compiler] logs"

