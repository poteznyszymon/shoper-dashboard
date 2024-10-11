import { Request, Response } from "express";
import { isProductRequired } from "../utils/checkRequired";
import prisma from "../prisma/prisma";
import { v2 } from "cloudinary";
import { ProductType } from "../types/product";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      title,
      shortDescription,
      fullDescription,
      material,
      images,
      color,
      sizes,
      gender,
      category,
      regularPrice,
      discountPrice,
    } = req.body as ProductType;

    if (!title || !shortDescription || !fullDescription) {
      res.status(400).json({
        success: "false",
        error: "Some required fields are missing",
      });
      return;
    }

    const colorsArray = typeof color === "string" ? JSON.parse(color) : color;
    const sizesArray = typeof sizes === "string" ? JSON.parse(sizes) : sizes;

    let imagesLinks: string[] = [];
    if (images && images.length > 0) {
      imagesLinks = await Promise.all(
        images.map(async (image) => {
          const imageResponse = await v2.uploader.upload(image);
          return imageResponse.secure_url;
        })
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        shortDescription,
        fullDescription,
        material,
        images: imagesLinks,
        color: colorsArray,
        sizes: sizesArray,
        gender,
        category,
        regularPrice: parseFloat(regularPrice),
        discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      },
    });

    res.status(200).json({
      success: "true",
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const allPosts = await prisma.product.findMany();
    res.status(200).json({ success: "true", products: allPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: "false", error: "Internal server error" });
  }
};
