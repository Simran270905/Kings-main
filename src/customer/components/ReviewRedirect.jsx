import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ReviewRedirect() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const orderId = params.get("orderId");
    const token = params.get("token");

    if (!orderId || !token) {
      navigate("/", { replace: true });
      return;
    }

    axios
      .get(`/api/reviews/verify-token?orderId=${orderId}&token=${token}`)
      .then((res) => {
        if (!res.data.valid) {
          navigate("/", { replace: true });
          return;
        }

        // Get first available product from order
        const firstProduct = res.data.products?.[0];
        if (firstProduct) {
          navigate(
            `/product/${firstProduct.productId}?review=true&orderId=${orderId}`,
            { replace: true }
          );
        } else {
          navigate("/", { replace: true });
        }
      })
      .catch(() => {
        navigate("/", { replace: true });
      });
  }, []);

  return <div>Redirecting to product...</div>;
}
