# JavaScript + Vite

## [ToDo](/TODO.md)

## Start

### env: Browser

1. Execute the following commands in the project directory via terminal:

```
npm i
npm run dev:browser
```

2. Open http://localhost:5173

### env: Node

- Execute the following commands in the project directory via terminal:

```
npm i
npm run dev:node
```

## Run tests (Vitest)

Watch mode:

```shell
npm test
```

Once:

```shell
npx vitest run
```

---

## Known issues

- Windows. Ошибка при `git commit`.  
  В сообщении (VS Code - Показать выходные данные команды/Show Command Output):  
  `ENOENT: no such file or directory, lstat 'C:\Users\%User%\AppData\Roaming\npm'`  
  **Решение** - создать директорию npm вручную по указанному пути.
