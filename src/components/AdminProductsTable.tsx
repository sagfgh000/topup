
'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductDialog } from './ProductDialog';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export default function AdminProductsTable() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
            productsData.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching products: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products.' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteDoc(doc(db, 'products', productId));
            toast({ title: 'Success', description: 'Product deleted successfully.' });
        } catch (error) {
            console.error("Error deleting product: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete product.' });
        }
    }
  };
  
  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
        if (editingProduct && editingProduct.id) {
            const productRef = doc(db, 'products', editingProduct.id);
            await updateDoc(productRef, productData);
            toast({ title: 'Success', description: 'Product updated successfully.' });
        } else {
            await addDoc(collection(db, 'products'), productData);
            toast({ title: 'Success', description: 'Product added successfully.' });
        }
    } catch (error) {
        console.error("Error saving product: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save product.' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                    Manage your products and view their sales performance.
                </CardDescription>
            </div>
            <Button size="sm" className="h-8 gap-1" onClick={handleAddProduct}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <Alert>
                <AlertTitle>No Products Found</AlertTitle>
                <AlertDescription>
                    You haven't added any products yet. Click "Add Product" to get started.
                </AlertDescription>
            </Alert>
          ) : (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {products.map((product) => (
                    <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.game}</TableCell>
                    <TableCell>৳{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDeleteProduct(product.id)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ProductDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </>
  );
}
