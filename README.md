# Huge JSON files to Columns

## How to use

 Install and build the app
```
npm install && npm run build
```

then give executable permissions to the `dist/index.js` file

```
chmod +x ./dist/index.js
```

And finally to run you can do
```
./dist/index.js <path-to-your-log-file>
```

## Benchmarks
`128MB` -  5:22:470 (m:ss:mmm)<br/>
`256MB` - 7:48.926   (m:ss.mmm)<br/>
`512MB` - 15:44.217 (m:ss.mmm)
