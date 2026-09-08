import { Suspense } from "react";
import ProductWrapper from "@/components/product/product-wrapper";

const page = () => {
    return (
        <Suspense>
            <ProductWrapper />
        </Suspense>
    );
}

export default page
