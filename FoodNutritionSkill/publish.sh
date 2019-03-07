\rm -rf lambda_upload.zip
zip -r lambda_upload.zip index.js food_db.json node_modules
aws lambda update-function-code --function-name FoodNutritionLookup --zip-file fileb://lambda_upload.zip