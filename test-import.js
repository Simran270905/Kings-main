// Test import resolution
import { useProduct } from './src/context/ProductContext';

console.log('✅ Import successful:', useProduct);

export default function TestImport() {
  return <div>Testing import resolution</div>;
}
