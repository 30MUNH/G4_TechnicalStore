// app.ts
import express from "express";
import cors from "cors";
import { Container } from "typedi";
import {
  useExpressServer,
  getMetadataArgsStorage,
  useContainer,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import swaggerUi from "swagger-ui-express";
import { AppDataSource, DbConnection } from "@/database/dbConnection";
import { ResponseInterceptor } from "./utils/interceptor/interceptor";

export default class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
  }

  public getServer() {
    return this.app;
  }

  public listen() {
    console.log();
    this.app.listen(this.port, () => {
      console.log(`🚀 Backend listening on port ${this.port}`);
      console.log(`📘 Api docs at: http://localhost:${this.port}/api-docs`);
    });
  }

  private initializeMiddlewares() {
    this.app.use(
      cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
      })
    );

    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (req.originalUrl.toString().includes("webhook")) {
          next();
        } else {
          express.json()(req, res, next);
        }
      }
    );

    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.static("public"));
  }

  private async connectToDatabase() {
    try {
      await DbConnection.createConnection();
      console.log("✅ Database connection established successfully.");
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      // console.log('Entities:', AppDataSource.options.entities);
      console.log(AppDataSource.entityMetadatas.map((e) => e.name));
    } catch (error) {
      console.error("❌ Failed to connect to the database: ", error);
      throw error;
    }
  }

  private initializeRoutes() {
    useContainer(Container);
    useExpressServer(this.app, {
      routePrefix: "/api",
      controllers: [__dirname + "/**/*.controller.{ts,js}"],
      interceptors: [ResponseInterceptor],
      middlewares: [__dirname + "/middlewares/**/*.middleware.{ts,js}"],
    });
  }

  private initializeSwagger() {
    const { defaultMetadataStorage } = require("class-transformer/cjs/storage");

    const schemas = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: "#/components/schemas/",
    });

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(
      storage,
      { routePrefix: "/api" },
      {
        components: {
          securitySchemes: {
            ApiKeyAuth: {
              type: "apiKey",
              name: "Authorization",
              in: "header",
              description: "API key for authorization",
            },
          },
          schemas,
        },
        security: [{ ApiKeyAuth: [] }],
        info: {
          title: "A sample API",
          version: "1.0.0",
          description: "Generated with routing-controllers-openapi",
        },
      }
    );
    // this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  }
}